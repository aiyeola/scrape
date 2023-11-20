# Use an official Node.js runtime as a parent image
FROM node:20.8-slim

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install 

# Bundle app source
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Define the command to run your app
CMD ["node", "app.js"]
