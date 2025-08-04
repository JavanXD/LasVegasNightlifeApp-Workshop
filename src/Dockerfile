# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the application code into the container
COPY package*.json ./

# Install dependencies, including development dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Install nodemon globally for live reloading
RUN npm install -g nodemon

# Expose the application port
EXPOSE 3000

# Command to start the application in development mode
CMD ["npm", "run", "dev"]