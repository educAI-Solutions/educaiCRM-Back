python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
get .env file from the CEO
uvicorn main:app --port 2020

Don't forget to have a redis server running on port 6379 for the chat to work
docker run -d --name redis-chat -p 6379:6379 redis
