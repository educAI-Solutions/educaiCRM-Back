from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from controller import ChatController

import uvicorn
import os
import uuid

app = FastAPI()
chat_controller = ChatController()

origins = [
    "http://localhost",
    "http://localhost:3000",  # Assuming your React app is running on port 3000
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Include OPTIONS method
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/testing")
async def testing():
    chat_id = str(uuid.uuid4())
    try:
        response = chat_controller.translate_to_french(chat_id, "I love programming.")
        return {"reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message")
    chat_id = data.get("chat_id")
    if not chat_id:
        chat_id = str(uuid.uuid4())
    try:
        response = chat_controller.chat_with_history(chat_id, user_message)
        return {"chat_id": chat_id, "reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 2020))  # Adjust the port as needed
    )
