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

echo -e "${GREEN}Stopping services...${NC}"

# Stop the services
docker-compose down

# Check if services stopped successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Services stopped successfully!${NC}"
    docker system prune -f
else
    echo -e "${RED}Failed to stop services${NC}"
    exit 1
fi 