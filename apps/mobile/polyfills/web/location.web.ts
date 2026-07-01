import * as ExpoFont from 'expo-font';

/**
 * Web-safe wrapper that avoids recursive imports
 */

export const useFonts = ExpoFont.useFonts;
export const loadAsync = ExpoFont.loadAsync;
export const isLoaded = ExpoFont.isLoaded;
export const unloadAsync = ExpoFont.unloadAsync;
export const getLoadedFonts = ExpoFont.getLoadedFonts;

export * from 'expo-font';

export default ExpoFont;