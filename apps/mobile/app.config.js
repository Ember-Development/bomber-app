// app.config.js
require('dotenv/config');

module.exports = {
  expo: {
    name: 'bomber-app',
    slug: 'bomber-app',
    owner: 'emberdevco',
    version: '1.0.12',
    orientation: 'portrait',
    icon: './assets/images/bomberappcover.png',
    scheme: 'bomber',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    entryPoint: './index.js',

    ios: {
      bundleIdentifier: 'com.bomberfastpitch.bomberapp',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
      entitlements: {
        'aps-environment': 'production',
      },
    },

    android: {
      package: 'com.emberdevco.bomberapp',
      targetSdkVersion: 35,
      versionCode: 8,
      adaptiveIcon: {
        foregroundImage: './assets/images/bombericonios.png',
        backgroundColor: '#ffffff',
      },
      googleServicesFile: './android/app/google-services.json',
      useNextNotificationsApi: true,
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      ['expo-updates', { enabled: false }],
      [
        'expo-splash-screen',
        {
          image: './assets/images/bombericon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
          },
        },
      ],
      [
        'expo-notifications',
        {
          // optional: provide a monochrome small icon for Android status bar
          // icon: './assets/notification-icon.png',
          color: '#FF231F7C',
        },
      ],
    ],

    experiments: { typedRoutes: true },

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
