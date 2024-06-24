FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

COPY /etc/letsencrypt/live/educaiapis.online/ /etc/letsencrypt/live/educaiapis.online/

EXPOSE 9090
CMD [ "node", "src/app.js" ]
