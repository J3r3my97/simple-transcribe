#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Check if service-specific .env files exist
if [ ! -f "backend/node-service/.env" ]; then
    echo -e "${RED}Error: Node.js backend .env file not found${NC}"
    echo "Please create backend/node-service/.env with the required environment variables"
    exit 1
fi

if [ ! -f "backend/python-service/.env" ]; then
    echo -e "${RED}Error: Python backend .env file not found${NC}"
    echo "Please create backend/python-service/.env with the required environment variables"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}Error: Frontend .env.local file not found${NC}"
    echo "Please create frontend/.env.local with the required environment variables"
    exit 1
fi

echo -e "${GREEN}Starting services...${NC}"

# Build and start the services
docker-compose up --build -d

# Check if services started successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Services started successfully!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Node Backend: http://localhost:3001${NC}"
    echo -e "${GREEN}Python Backend: http://localhost:8000${NC}"
    
    # Show logs
    echo -e "\n${GREEN}Showing logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
else
    echo -e "${RED}Failed to start services${NC}"
    exit 1
fi 