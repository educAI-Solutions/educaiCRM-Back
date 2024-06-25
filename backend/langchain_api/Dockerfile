# Use a Python base image
FROM python:3.9-slim

# Create app directory
WORKDIR /

# Install app dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Bundle app source code
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /home/azureuser/educai/educaiCRM-Back

# Copy SSL certificates to the container
COPY /home/azureuser/educai/educaiCRM-Back/key.pem /home/azureuser/educai/educaiCRM-Back/
COPY /home/azureuser/educai/educaiCRM-Back/cert.pem /home/azureuser/educai/educaiCRM-Back/

# Expose the port your app runs on
EXPOSE 2020

# Command to run your application
CMD ["python", "main.py"]
