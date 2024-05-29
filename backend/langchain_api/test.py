from langchain_openai import ChatOpenAI
from langchain.memory import ChatMessageHistory
import bs4
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_openai import ChatOpenAI
openai_key = os.getenv("OPENAI_API_KEY")

chat = ChatOpenAI(model="gpt-3.5-turbo-0125", api_key=openai_key)

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Try to rhyme whenever you answer.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("hi!")

demo_ephemeral_chat_history.add_ai_message("whats up?")

demo_ephemeral_chat_history.messages

demo_ephemeral_chat_history.add_user_message(
    "Como estas?"
)

response = chain.invoke({"messages": demo_ephemeral_chat_history.messages})

demo_ephemeral_chat_history.add_ai_message(response)

demo_ephemeral_chat_history.add_user_message("What did you just say?")

chain.invoke({"messages": demo_ephemeral_chat_history.messages})