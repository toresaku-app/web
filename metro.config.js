const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Zustand v5 ESM build uses import.meta.env which breaks on web
// Force CJS build by prioritizing "require" condition
config.resolver.unstable_conditionNames = ["react-native", "require", "default"];

module.exports = withNativeWind(config, { input: "./global.css" });
