python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
get .env file from the CEO
uvicorn main:app --port 2020
