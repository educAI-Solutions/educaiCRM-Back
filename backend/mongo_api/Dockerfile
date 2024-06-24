FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /etc/letsencrypt/live/educaiapis.online/

# Copy SSL certificates to the container
COPY /etc/letsencrypt/live/educaiapis.online/ /etc/letsencrypt/live/educaiapis.online/
COPY /etc/letsencrypt/live/educaiapis.online/ /etc/letsencrypt/live/educaiapis.online/

EXPOSE 5050
CMD [ "node", "src/app.js" ]
