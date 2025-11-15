import Constants from 'expo-constants';

/**
 * Platform-specific environment adapter for React Native/Expo.
 * Maps to 'shared-env' in tsconfig path resolution.
 */
export const API_BASE =
  (Constants?.expoConfig as any)?.extra?.apiBase ||
  process.env.EXPO_PUBLIC_API_BASE ||
  '';
