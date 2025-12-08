#!/bin/bash

# Polymarket Bot Dashboard - One-Click Deploy Script
# Usage: ./deploy.sh

set -e # Exit immediately if a command exits with a non-zero status.

APP_NAME="polymarket-dashboard"

echo "=========================================="
echo "🚀 Starting Deployment: $APP_NAME"
echo "=========================================="

# 1. Pull the latest code from GitHub
echo "📥 [1/4] Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# 2. Install Dependencies
echo "📦 [2/4] Installing dependencies..."
npm install

# 2.5 Sync Database Schema
echo "🗄️  [2.5/4] Syncing Database..."
npx prisma generate
npx prisma db push

# 3. Build the Next.js Application
echo "🏗️  [3/4] Building Next.js app..."
npm run build

# 4. Restart the Process Manager (PM2)
echo "🔄 [4/4] Restarting PM2 process..."
# Kill any existing process on port 3000 to avoid EADDRINUSE
echo "🧹 Cleaning up port 3000..."
fuser -k 3000/tcp || true

# Delete old PM2 process to ensure fresh start
if pm2 list | grep -q "$APP_NAME"; then
    pm2 delete "$APP_NAME"
fi

echo "🚀 Starting new instance..."
pm2 start npm --name "$APP_NAME" -- start
echo "✅ Process '$APP_NAME' started."

echo "=========================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=========================================="

