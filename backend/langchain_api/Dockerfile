FROM python:3.9-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Bundle app source
COPY . .

EXPOSE 2020
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "2020"]
