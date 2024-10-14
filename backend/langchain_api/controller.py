from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ChatMessageHistory
from fastapi import HTTPException
import os
import json
from dotenv import load_dotenv
import redis
import uuid
import requests
import psycopg2
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class ChatController:
    def __init__(self):
        try:
            openai_key = os.getenv("OPENAI_API_KEY")
            doc_store_api_url = "http://chroma_api:2525"
            # Initialize the Chat API with model
            self.chat = ChatOpenAI(model="gpt-3.5-turbo-0125", api_key=openai_key)
            self.prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", "You are a helpful assistant for a user trying to clear doubts about classes and courses."),
                    MessagesPlaceholder(variable_name="messages"),
                    MessagesPlaceholder(variable_name="documents"),
                ]
            )
            self.chain = self.prompt | self.chat
            # Initialize Redis client
            self.redis_client = redis.Redis(host='redis', port=6379, db=0)
            self.doc_store_api_url = doc_store_api_url
            # Initialize PostgreSQL connection
            self.postgres_conn = psycopg2.connect(
                dbname=os.getenv("POSTGRES_DB", "chat_history_db"),
                user=os.getenv("POSTGRES_USER", "your_user"),
                password=os.getenv("POSTGRES_PASSWORD", "your_password"),
                host="postgres"
            )
            logger.info("ChatController initialized successfully.")
        except Exception as e:
            logger.error(f"Error during ChatController initialization: {e}")
            raise

    @contextmanager
    def get_postgres_cursor(self):
        cursor = self.postgres_conn.cursor()
        try:
            yield cursor
            self.postgres_conn.commit()
        except Exception as e:
            self.postgres_conn.rollback()
            logger.error(f"Error during PostgreSQL operation: {e}")
            raise e
        finally:
            cursor.close()

    def _generate_chat_id(self):
        chat_id = str(uuid.uuid4())
        logger.info(f"Generated new chat ID: {chat_id}")
        return chat_id

    def _get_chat_key(self, chat_id):
        return f"chat:{chat_id}"

    def _get_chat_history(self, chat_id):
        try:
            chat_key = self._get_chat_key(chat_id)
            chat_history_json = self.redis_client.get(chat_key)
            if chat_history_json:
                messages = json.loads(chat_history_json)
                reconstructed_messages = []
                for msg in messages:
                    if msg["role"] == "human":
                        reconstructed_messages.append(HumanMessage(content=msg["msg"]))
                    elif msg["role"] == "ai":
                        reconstructed_messages.append(AIMessage(content=msg["msg"]))
                    else:
                        raise ValueError("Unsupported message role")
                logger.info(f"Chat history retrieved from Redis for chat_id: {chat_id}")
                return ChatMessageHistory(messages=reconstructed_messages)
            logger.info(f"No chat history found in Redis for chat_id: {chat_id}")
            return ChatMessageHistory()
        except Exception as e:
            logger.error(f"Error retrieving chat history from Redis for chat_id: {chat_id}: {e}")
            raise

    def _save_chat_history(self, chat_id, chat_history):
        try:
            chat_key = self._get_chat_key(chat_id)
            serialized_messages = []
            for msg in chat_history.messages:
                if isinstance(msg, HumanMessage):
                    serialized_msg = {"role": "human", "msg": msg.content}
                elif isinstance(msg, AIMessage):
                    serialized_msg = {"role": "ai", "msg": msg.content}
                else:
                    raise ValueError("Unsupported message type")

                serialized_messages.append(serialized_msg)

            # Save to Redis for quick access
            self.redis_client.setex(chat_key, 300, json.dumps(serialized_messages))
            logger.info(f"Chat history saved to Redis for chat_id: {chat_id}")

            # Save to PostgreSQL for long-term storage
            self._save_chat_history_postgres(chat_id, serialized_messages)
        except Exception as e:
            logger.error(f"Error saving chat history for chat_id: {chat_id}: {e}")
            raise

    def _save_chat_history_postgres(self, chat_id, serialized_messages):
        try:
            with self.get_postgres_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO chat_histories (chat_id, chat_data)
                    VALUES (%s, %s)
                    ON CONFLICT (chat_id)
                    DO UPDATE SET chat_data = EXCLUDED.chat_data;
                """, (chat_id, json.dumps(serialized_messages)))
            logger.info(f"Chat history saved to PostgreSQL for chat_id: {chat_id}")
        except Exception as e:
            logger.error(f"Error saving chat history to PostgreSQL for chat_id: {chat_id}: {e}")
            raise

    def add_user_message(self, chat_id, message: str):
        try:
            chat_history = self._get_chat_history(chat_id)
            chat_history.add_user_message(message)
            self._save_chat_history(chat_id, chat_history)
            logger.info(f"User message added for chat_id: {chat_id}")
        except Exception as e:
            logger.error(f"Error adding user message for chat_id: {chat_id}: {e}")
            raise

    def add_ai_message(self, chat_id, message: str):
        try:
            chat_history = self._get_chat_history(chat_id)
            chat_history.add_ai_message(message)
            self._save_chat_history(chat_id, chat_history)
            logger.info(f"AI message added for chat_id: {chat_id}")
        except Exception as e:
            logger.error(f"Error adding AI message for chat_id: {chat_id}: {e}")
            raise

    def get_response(self, chat_id, program_uuid=None):
        try:
            chat_history = self._get_chat_history(chat_id)
            user_message = chat_history.messages[-1].content  # Get the latest user message
            retrieved_docs = self.retrieve_documents(user_message, program_uuid)
            logger.info(f"Documents retrieved for chat_id: {chat_id}, program_uuid: {program_uuid}")

            if not retrieved_docs or retrieved_docs[0][1] < 0.5:
                response = self.chain.invoke({
                    "messages": chat_history.messages,
                    "documents": []
                })
                chat_history.add_ai_message(response.content)
            else:
                response = self.chain.invoke({
                    "messages": chat_history.messages,
                    "documents": [doc[0]["page_content"] for doc in retrieved_docs]
                })
                chat_history.add_ai_message(response.content)

            self._save_chat_history(chat_id, chat_history)
            logger.info(f"AI response generated for chat_id: {chat_id}, program_uuid: {program_uuid}")
            return response
        except Exception as e:
            logger.error(f"Error generating response for chat_id: {chat_id}, program_uuid: {program_uuid}: {e}")
            raise

    def retrieve_documents(self, query, program_id=None):
        try:
            # If program_id is provided, include it in the request to the Chroma API
            request_payload = {"query": query}
            if program_id:
                request_payload["program_id"] = program_id
            
            print(f"Request payload: {request_payload}")
            
            response = requests.post(f"{self.doc_store_api_url}/search", json=request_payload)
            
            if response.status_code == 200:
                logger.info(f"Documents successfully retrieved for query: {query} and program_id: {program_id}")
                return response.json().get("results", [])
            else:
                logger.error(f"Error retrieving documents from document store: {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Error retrieving documents")
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            raise

    def translate_to_french(self, chat_id, text: str):
        try:
            self.add_user_message(chat_id, f"Translate this sentence from English to French: {text}")
            response = self.get_response(chat_id)
            return response.content
        except Exception as e:
            logger.error(f"Error translating to French for chat_id: {chat_id}: {e}")
            raise

    def chat_with_history(self, chat_id, user_message: str, program_uuid: str):
        try:
            self.add_user_message(chat_id, user_message)
            response = self.get_response(chat_id, program_uuid)
            return response.content
        except Exception as e:
            logger.error(f"Error during chat_with_history for chat_id: {chat_id}, program_uuid: {program_uuid}: {e}")
            raise
