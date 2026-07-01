// DO NOT import expo-font here.
// We create a safe mock for web to stop recursive imports.

export const useFonts = () => {
  return [true, null];
};

export const loadAsync = async () => {
  return Promise.resolve();
};

export const isLoaded = () => true;

export const unloadAsync = async () => {
  return Promise.resolve();
};

export const getLoadedFonts = () => [];

export default {
  useFonts,
  loadAsync,
  isLoaded,
  unloadAsync,
  getLoadedFonts,
};