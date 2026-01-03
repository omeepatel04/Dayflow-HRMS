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

# Expose the Vite development server port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
