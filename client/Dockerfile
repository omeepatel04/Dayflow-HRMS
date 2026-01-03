# Frontend Dockerfile for Dayflow HRMS
FROM node:20-alpine

# Set working directory
WORKDIR /app/client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the server port
EXPOSE 3000

# Build the application
RUN npm run build

# Start the static server on all interfaces for container use
CMD ["npx", "serve", "-s", "dist", "-l", "3000", "-n"]
