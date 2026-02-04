/** @type {import('expo/metro-config').MetroConfig} */

const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getSentryExpoConfig(__dirname);

config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
  },
};


module.exports = wrapWithReanimatedMetroConfig(config);