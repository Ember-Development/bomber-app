// app.config.js
require('dotenv/config');

module.exports = {
  expo: {
    name: 'bomber-app',
    slug: 'bomber-app',
    owner: 'emberdevco',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/images/bombericonios.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    entryPoint: './index.js',

    ios: {
      bundleIdentifier: 'com.bomberfastpitch.bomberapp',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
    },

    android: {
      package: 'com.emberdevco.bomberapp',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/images/bombericonios.png',
        backgroundColor: '#ffffff',
      },
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          image: './assets/images/bombericon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],

    experiments: { typedRoutes: true },

    updates: {
      url: 'https://u.expo.dev/5716a622-1434-422d-a9af-fb8aab33b8c3',
      // optional but recommended:
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },

    runtimeVersion: {
      policy: 'appVersion',
    },

    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL,
      eas: { projectId: '5716a622-1434-422d-a9af-fb8aab33b8c3' },
    },
  },
};
