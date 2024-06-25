# Use a Node.js base image
FROM node:20-slim

# Create app directory
WORKDIR /

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source code
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /home/azureuser/educai/educaiCRM-Back

# Copy SSL certificates to the container
COPY /home/azureuser/educai/educaiCRM-Back/key.pem /home/azureuser/educai/educaiCRM-Back/
COPY /home/azureuser/educai/educaiCRM-Back/cert.pem /home/azureuser/educai/educaiCRM-Back/

# Expose the port your app runs on
EXPOSE 5050

# Command to run your application
CMD [ "node", "src/app.js" ]
