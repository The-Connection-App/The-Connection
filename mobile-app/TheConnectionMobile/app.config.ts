import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'The Connection',
  slug: 'the-connection',
  scheme: 'theconnection',
  version: '1.0.0',
  owner: 'the-connection-app',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.theconnection.mobile',
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'Allow access to choose a profile image.',
      NSCameraUsageDescription: 'Allow camera use for profile or content images.',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
      },
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'app.theconnection.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-router',
      {
        origin: 'https://app.theconnection',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'c11dcfad-026c-4c8d-8dca-bec9e2bc049a',
    },
    // Dynamic environment injection - available via Constants.expoConfig.extra.apiBase
    apiBase: process.env.EXPO_PUBLIC_API_BASE,
    router: {
      origin: 'https://app.theconnection',
    },
  },
  updates: {
    url: 'https://u.expo.dev/c11dcfad-026c-4c8d-8dca-bec9e2bc049a',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
});
