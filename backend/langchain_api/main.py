from fastapi import FastAPI, HTTPException # type: ignore
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

load_dotenv()   # Load environment variables from .env file

openai_api_key = os.getenv("OPENAI_API_KEY")
chat = ChatOpenAI(api_key=openai_api_key, model="gpt-3.5-turbo-0125")

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/testing")
async def testing():
    response = chat.invoke(
        [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            )
        ]
    )
    return {"reply": response}