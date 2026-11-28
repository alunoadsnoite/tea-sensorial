#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
export CI=1 EXPO_NO_TELEMETRY=1 NODE_ENV=production
node <<'JS'
const fs = require('node:fs');
const packagePath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(packagePath));
pkg.expo = { autolinking: { android: { buildFromSource: ['.*'] } } };
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

const configPath = 'app.json';
const config = JSON.parse(fs.readFileSync(configPath));
config.expo.android.blockedPermissions = [...new Set([
  ...(config.expo.android.blockedPermissions ?? []),
  'android.permission.INTERNET',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.READ_CONTACTS',
])];
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
JS
npx --no-install expo prebuild --platform android --no-install
# Match the NDK selected by the root Expo project and the F-Droid recipe.
# AGP's library default otherwise selects 27.0 while F-Droid provides 27.1.
sed -i '/^android {$/a\  ndkVersion rootProject.ext.ndkVersion' node_modules/expo-sqlite/android/build.gradle
sed -i '/signingConfig signingConfigs\.debug/d' android/app/build.gradle
find node_modules -type d -name local-maven-repo -prune -exec rm -r {} +
rm -rf node_modules/hermes-compiler/hermesc/osx-bin node_modules/hermes-compiler/hermesc/win64-bin
find node_modules -type f -name gradle-wrapper.jar -delete
find node_modules/expo-sqlite/android/libsql node_modules/expo-sqlite/android/vec -type f -name '*.so' -delete
