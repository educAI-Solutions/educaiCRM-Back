# Use a Node.js base image
FROM node:20-slim

# Create app directory
WORKDIR /

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source code
COPY . .


# Expose the port your app runs on
EXPOSE 9090

# Command to run your application
CMD [ "node", "src/app.js" ]
