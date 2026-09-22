#!/bin/bash
# ==========================================
# Niyanta AI - AWS EC2 Automated Deployment Script
# ==========================================
set -e

echo "🚀 Starting Niyanta AI AWS Deployment..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y

# 2. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker not found. Installing Docker..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER || true
    echo "✅ Docker installed successfully."
fi

# 3. Setup Environment File
if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        echo "📝 Created .env from .env.production.example"
    fi
fi

# 4. Build & Launch Docker Containers
echo "🏗️ Building and starting production containers..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 5. Output Status
echo ""
echo "========================================================"
echo "🎉 Niyanta AI Deployment Completed!"
echo "========================================================"
sudo docker compose -f docker-compose.prod.yml ps
echo "========================================================"
echo "🌐 Access the application at: http://$(curl -s ifconfig.me)"
echo "========================================================"
