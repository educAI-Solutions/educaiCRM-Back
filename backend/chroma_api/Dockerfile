# Use a Python base image
FROM python:3.9-slim

# Create app directory
WORKDIR /

# Install app dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Bundle app source
COPY . .
# Expose the port your app runs on
EXPOSE 2525

# Command to run your application
CMD ["python", "main.py"]
