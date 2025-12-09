#!/bin/bash

# Build script for Jiosaavan Music App APK

echo "Starting build process for Jiosaavan Music App..."

# Navigate to the project directory
cd /workspace/JiosaavanMusicApp

# Install dependencies
echo "Installing dependencies..."
npm install

# Install React Native Track Player Android dependencies
cd android
./gradlew clean
cd ..

# Build the APK
echo "Building APK..."
npx react-native build-android --mode=release

echo "APK build process completed!"
echo "Find your APK at: /workspace/JiosaavanMusicApp/android/app/build/outputs/apk/release/app-release.apk"