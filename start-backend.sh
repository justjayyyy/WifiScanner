#!/bin/bash

# WiFi Visualizer Backend Startup Script
# This script starts the backend server with sudo permissions
# to enable real WiFi network name detection

cd "$(dirname "$0")"

echo "🚀 Starting WiFi Visualizer Backend with elevated permissions..."
echo "📡 This will allow the app to display real WiFi network names"
echo ""

sudo node server/index.js
