# Mobile App Setup (Capacitor)

This project now supports Android and iOS mobile apps using Capacitor.

## What Was Added

- Capacitor packages in package.json
- capacitor.config.json
- android/ native project
- npm scripts for mobile build/sync/open/run

## Quick Commands

- Install dependencies:
  - npm install
- Sync web app into native projects:
  - npm run mobile:sync
- Open Android project in Android Studio:
  - npm run mobile:android
- Build and run on connected Android device/emulator:
  - npm run mobile:android:run
- Open iOS project in Xcode (macOS only):
  - npm run mobile:ios

## First-Time Android Setup

1. Install Android Studio.
2. Install an SDK platform and emulator image from Android Studio SDK Manager.
3. Run:
   - npm run mobile:android
4. In Android Studio, click Run to build and launch.

## iOS Notes

- iOS builds require macOS + Xcode.
- You can run npm run mobile:ios on a Mac to open the iOS project.

## Developer Workflow

When code changes in src/:

1. npm run mobile:sync
2. Re-run from Android Studio (or Xcode on macOS)

Capacitor copies the latest dist/ output into native projects during sync.
