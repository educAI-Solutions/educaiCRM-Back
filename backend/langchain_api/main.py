from fastapi import FastAPI, HTTPException, Request
from controller import ChatController
import uuid

app = FastAPI()
chat_controller = ChatController()

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
