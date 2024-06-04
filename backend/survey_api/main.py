from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from controller import create_form, authorize, oauth2callback
import uvicorn

app = FastAPI()

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
def create_form_route():
    return create_form()

@app.get("/authorize")
def authorize_route(request: Request):
    return authorize(request)

@app.get("/oauth2callback")
def oauth2callback_route(request: Request):
    return oauth2callback(request)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)