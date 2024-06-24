FROM python:3.9-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Bundle app source
COPY . .

COPY /etc/letsencrypt/live/educaiapis.online/ /etc/letsencrypt/live/educaiapis.online/

EXPOSE 2020
CMD ["python", "main.py"]

