#!/bin/bash

# Production build script for Weaviate Admin UI
set -e

echo "🚀 Building Weaviate Admin UI for production..."

# Set production environment variables
export NODE_ENV=production
export REACT_APP_WEAVIATE_ENDPOINT=${REACT_APP_WEAVIATE_ENDPOINT:-"https://weaviate.cmsinfosec.com/v1"}
export PUBLIC_URL=${PUBLIC_URL:-"https://vectorui.cmsinfosec.com"}

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building client application..."
npm run build:client

echo "🔨 Building server application..."
npm run build:server

echo "🧹 Cleaning up..."
# Remove unnecessary files for production
rm -rf node_modules/.cache
rm -rf .vite

echo "✅ Production build completed successfully!"
echo "📁 Client build output: dist/spa/"
echo "📁 Server build output: dist/server/"

# Display build info
echo ""
echo "📊 Build information:"
echo "  Weaviate Endpoint: $REACT_APP_WEAVIATE_ENDPOINT"
echo "  Public URL: $PUBLIC_URL"
echo "  Build size:"
du -sh dist/spa/ 2>/dev/null || echo "  Unable to determine build size"

echo ""
echo "�� Ready for Docker build!"
