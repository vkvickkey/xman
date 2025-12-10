#!/bin/bash

# Build script for Jiosaavan Music App APK

echo "Starting build process for Jiosaavan Music App..."

# Navigate to the project directory
cd /workspace/JiosaavanMusicApp

# Install dependencies with legacy peer deps to avoid conflicts
echo "Installing dependencies..."
npm install --legacy-peer-deps || echo "Continuing with potential dependency issues..."

# Link native modules
echo "Linking native modules..."
npx react-native link

# Navigate to android directory and build APK
cd android

echo "Cleaning previous builds..."
./gradlew clean

echo "Building release APK..."
./gradlew assembleRelease

echo "APK build process completed!"
echo "Find your APK at: /workspace/JiosaavanMusicApp/android/app/build/outputs/apk/release/app-release.apk"

# Check if APK was created
if [ -f "/workspace/JiosaavanMusicApp/android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "APK successfully created!"
    ls -la /workspace/JiosaavanMusicApp/android/app/build/outputs/apk/release/app-release.apk
else
    echo "APK build failed. Checking for debug APK..."
    if [ -f "/workspace/JiosaavanMusicApp/android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        echo "Debug APK was created instead:"
        ls -la /workspace/JiosaavanMusicApp/android/app/build/outputs/apk/debug/app-debug.apk
    else
        echo "No APK files were created. Check the build logs above for errors."
    fi
fi