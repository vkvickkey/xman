# Jiosaavan Music App - Your Ultimate Ad-Free Music Companion

## Overview
Melody is a multilingual Jiosaavan Music frontend for Android, built with React Native and harnessing the power of JioSavan's Unofficial API. It offers a seamless music streaming experience at your fingertips with high-quality audio playback and an intuitive interface.

## Features
- ✅ Multilingual support (English, Hindi, Tamil)
- ✅ Ad-free music streaming
- ✅ High-quality audio playback using React Native Track Player
- ✅ Smooth and intuitive interface with React Native Reanimated
- ✅ JioSaavn Unofficial API integration
- ✅ Search functionality for songs, artists, and albums
- ✅ Now playing section with playback controls
- ✅ Playlists and recommendations
- ✅ Performance optimized

## Technical Stack
- **React Native**: Cross-platform mobile development
- **React Native Track Player**: High-quality audio playback
- **React Native Reanimated**: Smooth animations and transitions
- **React Native Gesture Handler**: Enhanced touch interactions
- **Axios**: API requests
- **React Navigation**: Screen navigation
- **i18next & react-i18next**: Multilingual support
- **JioSaavn Unofficial API**: Music data source

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Java Development Kit (JDK)

### Steps to Run
1. Clone the repository:
```bash
git clone <repository-url>
cd JiosaavanMusicApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

4. Run the application:
```bash
# For Android
npx react-native run-android

# For iOS
npx react-native run-ios
```

### For Android APK Build
To generate a release APK:

1. Make sure you have Android Studio installed with the Android SDK
2. Navigate to the project directory
3. Run the following command:

```bash
cd android
./gradlew assembleRelease
```

The APK file will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure
```
JiosaavanMusicApp/
├── App.tsx                 # Main application component
├── app.json               # Application configuration
├── package.json           # Project dependencies
├── android/              # Android native files
├── ios/                  # iOS native files
└── README.md             # Project documentation
```

## Key Components

### App.tsx
The main component includes:
- Multilingual support with i18next
- Music playback functionality with TrackPlayer
- JioSaavn API integration
- Responsive UI with dark theme
- Now playing section
- Playlist browsing
- Search functionality

### Multilingual Support
The app supports multiple languages:
- English
- Hindi
- Tamil
- Easy to extend to more languages

### Audio Playback
- Uses React Native Track Player for high-quality audio
- Supports play, pause, and track switching
- Now playing section with album art

## API Integration
The app integrates with JioSaavn's Unofficial API to fetch:
- Songs and albums
- Artist information
- Playlists and recommendations
- Search results

## Performance Optimizations
- Efficient list rendering with FlatList
- Lazy loading for better performance
- Optimized state management
- Memory efficient image loading

## Build Instructions for APK

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK 8 or higher

### Steps
1. Navigate to the android directory:
```bash
cd android
```

2. Build the release APK:
```bash
./gradlew assembleRelease
```

3. Find the APK at:
```
app/build/outputs/apk/release/app-release.apk
```

### Alternative Build Method
Use the provided build script:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License.

## Acknowledgments
- Built with React Native
- Powered by JioSaavn Unofficial API
- Audio playback by React Native Track Player
- Animations by React Native Reanimated
- Navigation by React Navigation
- Localization by i18next