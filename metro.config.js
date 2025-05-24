const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1️⃣ Turn off the new, strict "exports" resolution so Metro can fall back to
// the browser fields in package.json instead of the Node‐only entrypoints.
// This is the same workaround recommended upstream in the Expo repo :contentReference[oaicite:0]{index=0}.
config.resolver.unstable_enablePackageExports = false;

// 2️⃣ Make sure Metro prefers the browser build of modules before Node’s "main"
config.resolver.resolverMainFields = [
  'react-native', // first look for react-native-specific entry
  'browser',      // then look for browser-friendly bundle
  'main'          // finally fallback to main
];

module.exports = config;