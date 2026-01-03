# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app/client

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/client/dist ./dist

# Copy package.json for reference
COPY package*.json ./

# Expose port
EXPOSE 5173

# Serve the app
CMD ["serve", "-s", "dist", "-l", "5173"]
