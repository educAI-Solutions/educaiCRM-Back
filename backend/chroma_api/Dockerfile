FROM python:3.9-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Bundle app source
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /etc/letsencrypt/live/educaiapis.online/

# Copy SSL certificates to the container
COPY /etc/letsencrypt/live/educaiapis.online/privkey.pem /etc/letsencrypt/live/educaiapis.online/
COPY /etc/letsencrypt/live/educaiapis.online/fullchain.pem /etc/letsencrypt/live/educaiapis.online/

EXPOSE 2525
CMD ["python", "main.py"]