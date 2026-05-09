#!/bin/bash
set -e

echo "=== Flutter Web Build Started ==="

# Disable analytics to speed up build
flutter config --no-analytics

# Enable web support
flutter config --enable-web

# Clean old builds
echo "Cleaning..."
flutter clean

# Get dependencies
echo "Getting dependencies..."
flutter pub get

# Build web
echo "Building web..."
flutter build web --release

echo "=== Build Complete ==="