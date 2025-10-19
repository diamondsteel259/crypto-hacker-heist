#!/bin/bash

# Crypto Hacker Heist - Production Build Script

set -e

echo "🚀 Building Crypto Hacker Heist for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Build backend
echo "⚙️  Building backend..."
npm run build:server

# Create dist directory structure
echo "📁 Creating dist directory..."
mkdir -p dist/public
mkdir -p dist/server

# Copy built files
echo "📋 Copying built files..."
cp -r client/dist/* dist/public/
cp -r server-dist/* dist/server/

# Copy package files
echo "📄 Copying package files..."
cp package.json dist/
cp package-lock.json dist/

# Copy public assets
echo "🖼️  Copying public assets..."
if [ -d "public" ]; then
  cp -r public/* dist/public/
fi

echo "✅ Build complete! Deploy the 'dist' directory to your web hosting."
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables on your server (see .env.example)"
echo "2. Upload dist/ folder to your web hosting"
echo "3. Run 'npm install --production' on the server"
echo "4. Set up a process manager (PM2 recommended)"
echo "5. Configure nginx/apache reverse proxy (see DEPLOYMENT.md)"
echo ""
echo "🎉 Happy deploying!"
