#!/bin/sh
# Start the backend server in the background
echo "Starting Backend Server..."
node backend/dist/server.js &

# Wait for backend to start slightly (optional)
sleep 2

# Start the frontend server in the foreground using the standalone build
echo "Starting Next.js Frontend Server (Standalone Mode)..."
export PORT=3000
node server.js
