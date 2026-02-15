const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to inject a resolution strategy into android/app/build.gradle
 * to resolve duplicate class issues between legacy support libraries and AndroidX.
 */
const withAndroidXResolution = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addResolutionStrategy(config.modResults.contents);
    }
    return config;
  });
};

function addResolutionStrategy(contents) {
  // Check if it's already there to avoid duplicate injections
  if (contents.includes('resolutionStrategy')) {
    return contents;
  }

  const resolutionStrategy = `
configurations.all {
    resolutionStrategy {
        force 'androidx.core:core:1.16.0'
        force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
        force 'androidx.appcompat:appcompat:1.7.0'
    }
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'versionedparcelable'
    exclude group: 'com.android.support', module: 'animated-vector-drawable'
    exclude group: 'com.android.support', module: 'support-vector-drawable'
    exclude group: 'com.android.support', module: 'appcompat-v7'
}
`;

  // We append it to the end of the file or after the dependencies block
  return contents + resolutionStrategy;
}

module.exports = withAndroidXResolution;
