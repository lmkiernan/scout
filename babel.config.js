module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
        safe: false,
        allowlist: null,
        blocklist: null,
        blacklist: null,
        whitelist: null,
        extensions: ['.ts', '.tsx', '.js', '.jsx'] // ← ADD THIS LINE
      }],
    ],
  };