# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install Python for youtube-dl-exec

RUN apk add --no-cache python3

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app


# Install Python for youtube-dl-exec
RUN apk add --no-cache python3

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "dist/index.js"] 