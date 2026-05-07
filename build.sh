#!/bin/bash
set -e

# Download and extract Flutter
curl -o flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz
tar xf flutter.tar.xz

# Fix ownership issue - tell Git this directory is safe
git config --global --add safe.directory /vercel/path0/flutter
git config --global --add safe.directory '*'

# Add Flutter to PATH
export PATH="$PATH:`pwd`/flutter/bin"

# Configure Flutter for web
flutter config --enable-web

# Clean previous builds
flutter clean

# Get dependencies
flutter pub get

# Build for web
flutter build web --release