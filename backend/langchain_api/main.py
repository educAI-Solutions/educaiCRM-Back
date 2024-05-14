from fastapi import FastAPI, HTTPException # type: ignore
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125")
load_dotenv()   # Load environment variables from .env file

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/testing")
async def testing():
    
    return {"message": "Testing"}