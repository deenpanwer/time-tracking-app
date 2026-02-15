const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = config;

// Standard way to add SVG support to Expo Metro config
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: [...assetExts.filter((ext) => ext !== "svg"), "ttf"],
  sourceExts: [...sourceExts, "svg", "mjs", "cjs"],
};

// Ensure CSS files are watched and processed
module.exports = withNativeWind(config, { 
  input: "./global.css",
  inlineStyles: true // Helps with style loading stability in some environments
});