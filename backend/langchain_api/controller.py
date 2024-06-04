from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ChatMessageHistory
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from fastapi import HTTPException
import os
import json
from dotenv import load_dotenv
import redis
import uuid
import requests
import logging

load_dotenv()

# Configuración básica del logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ChatController:
    def __init__(self):
        openai_key = os.getenv("OPENAI_API_KEY")
        doc_store_api_url = os.getenv("DOC_STORE_API_URL")
        # Could use gpt-4o for better performance and updated model
        self.chat = ChatOpenAI(model="gpt-3.5-turbo-0125", api_key=openai_key)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful assistant for a user who is trying to clear their doubts about topics related to classes and courses. ",
                ),
                MessagesPlaceholder(variable_name="messages"),
                MessagesPlaceholder(variable_name="documents"),
            ]
        )
        self.chain = self.prompt | self.chat
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.doc_store_api_url = doc_store_api_url

    def _generate_chat_id(self):
        chat_id = str(uuid.uuid4())
        logger.debug(f"Generated chat ID: {chat_id}")
        return chat_id

    def _get_chat_key(self, chat_id):
        return f"chat:{chat_id}"

    def _get_chat_history(self, chat_id):
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
            logger.debug(f"Retrieved chat history for chat ID {chat_id}: {reconstructed_messages}")
            return ChatMessageHistory(messages=reconstructed_messages)
        logger.info(f"No chat history found for chat ID {chat_id}. Creating new chat history.")
        return ChatMessageHistory()

    def _save_chat_history(self, chat_id, chat_history):
        chat_key = self._get_chat_key(chat_id)
        serialized_messages = []
        for msg in chat_history.messages:
            if isinstance(msg, HumanMessage):
                serialized_msg = {
                    "role": "human",
                    "msg": msg.content
                }
            elif isinstance(msg, AIMessage):
                serialized_msg = {
                    "role": "ai",
                    "msg": msg.content
                }
            else:
                raise ValueError("Unsupported message type")

            serialized_messages.append(serialized_msg)
        
        logger.info(f"Saving chat history for chat ID {chat_id}.")
        self.redis_client.setex(chat_key, 300, json.dumps(serialized_messages))

    def add_user_message(self, chat_id, message: str):
        logger.info(f"Adding user message to chat ID {chat_id}. Message: {message}")
        chat_history = self._get_chat_history(chat_id)
        chat_history.add_user_message(message)
        self._save_chat_history(chat_id, chat_history)

    def add_ai_message(self, chat_id, message: str):
        logger.info(f"Adding AI message to chat ID {chat_id}. Message: {message}")
        chat_history = self._get_chat_history(chat_id)
        chat_history.add_ai_message(message)
        self._save_chat_history(chat_id, chat_history)

    def get_response(self, chat_id):
        logger.debug(f"Getting response for chat ID {chat_id}")
        chat_history = self._get_chat_history(chat_id)
        user_message = chat_history.messages[-1].content  # Get the latest user message
        logger.debug(f"Latest user message: {user_message}")
        retrieved_docs = self.retrieve_documents(user_message)
        logger.debug(f"Retrieved documents: {retrieved_docs}")
        # leave documents empty if docs[1] is less than 0.5
        # Needs at least 50% confidence to use the retrieved documents
        if retrieved_docs[0][1] < 0.5:
            response = self.chain.invoke({
                "messages": chat_history.messages,
                "documents": []
            })
            chat_history.add_ai_message(response.content)
            self._save_chat_history(chat_id, chat_history)
            return response
        
        response = self.chain.invoke({
            "messages": chat_history.messages,
            "documents": [doc[0]["page_content"] for doc in retrieved_docs]
        })
        chat_history.add_ai_message(response.content)
        self._save_chat_history(chat_id, chat_history)
        return response

    def retrieve_documents(self, query):
        logger.info(f"Retrieving documents for query: {query}")
        response = requests.post(f"{self.doc_store_api_url}/search", json={"query": query})
        if response.status_code == 200:
            return response.json().get("results", [])
        else:
            logger.error(f"Error retrieving documents. Status code: {response.status_code}")
            raise HTTPException(status_code=response.status_code, detail="Error retrieving documents")

    def translate_to_french(self, chat_id, text: str):
        self.add_user_message(chat_id, f"Translate this sentence from English to French: {text}")
        response = self.get_response(chat_id)
        return response.content

    def chat_with_history(self, chat_id, user_message: str):
        self.add_user_message(chat_id, user_message)
        response = self.get_response(chat_id)
        return response.content
