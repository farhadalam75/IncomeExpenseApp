#!/bin/bash

# 📱 Build Android APK Script
# This script builds an Android APK from your Income Expense App

set -e  # Exit on any error

echo "🚀 Starting Android APK build process..."
echo "================================================"

# Navigate to ClientApp directory
cd "$(dirname "$0")/IncomeExpenseApp/ClientApp"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building React app..."
npm run build

echo "📱 Setting up Capacitor Android..."

# Ensure Capacitor is installed
if ! command -v cap &> /dev/null; then
    echo "Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Ensure Android platform is installed
if [ ! -f "package.json" ] || ! grep -q "@capacitor/android" package.json; then
    echo "Installing Capacitor Android platform..."
    npm install @capacitor/android
fi

# Initialize Capacitor if not already done
if [ ! -f "capacitor.config.ts" ]; then
    echo "Initializing Capacitor..."
    npx cap init "Income Expense App" "com.incomeexpense.app"
fi

# Add Android platform if not already added
if [ ! -d "android" ]; then
    echo "Adding Android platform..."
    npx cap add android
fi

echo "📋 Copying web assets to Android..."
npx cap copy android

echo "🔧 Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
echo "Building debug APK..."
./gradlew assembleDebug

# Check if APK was created successfully
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully!"
    echo "📍 Location: $(pwd)/$APK_PATH"
    echo "📏 Size: $(du -h "$APK_PATH" | cut -f1)"
    
    # Copy APK to project root for easy access
    cp "$APK_PATH" "../../income-expense-app.apk"
    echo "📋 APK copied to: $(cd ../..; pwd)/income-expense-app.apk"
    
    echo ""
    echo "🎉 SUCCESS! Your Android APK is ready!"
    echo "================================================"
    echo "📱 APK Location: $(cd ../..; pwd)/income-expense-app.apk"
    echo ""
    echo "🔄 Installation Instructions:"
    echo "1. Transfer the APK to your Android device"
    echo "2. Enable 'Install from Unknown Sources' in Android settings"
    echo "3. Open the APK file and install"
    echo "4. Open the app and enjoy!"
    echo ""
    echo "🌐 Alternative: Use as PWA (easier)"
    echo "1. Deploy your app to Railway/Vercel"
    echo "2. Open URL in Chrome mobile"
    echo "3. Tap 'Add to Home Screen'"
    echo "4. App installs like native app!"
    
else
    echo "❌ APK build failed - file not found at $APK_PATH"
    exit 1
fi