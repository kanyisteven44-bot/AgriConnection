import { useAuth } from "@/utils/auth/useAuth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { AuthModal } from "@/utils/auth/useAuthModal";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/dev";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SplashScreenView({ onFinish }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // After 2 seconds, animate out
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale }] }]}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.appName}>AgriConnection</Text>
        <Text style={styles.tagline}>Grow Smarter. Sell Faster. Earn Better.</Text>
      </Animated.View>
      <View style={styles.loaderContainer}>
        <View style={styles.loaderBar}>
          <LoadingBar />
        </View>
      </View>
      <Text style={styles.splashVersion}>Kenya's #1 Agriculture Platform</Text>
    </Animated.View>
  );
}

function LoadingBar() {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: 100,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.loaderFill,
        {
          width: width.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          }),
        },
      ]}
    />
  );
}

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontsError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    initiate();
  }, [initiate]);

  // Hide native splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontsError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  // Show splash while loading
  if (!fontsLoaded && !fontsError) {
    return (
      <View style={styles.splashContainer} onLayout={onLayoutRootView}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🌾</Text>
          </View>
          <Text style={styles.appName}>AgriConnection</Text>
          <Text style={styles.tagline}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (showSplash) {
    return (
      <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
        <SplashScreenView onFinish={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="advisor" />
          <Stack.Screen name="disease" />
          <Stack.Screen name="learning" />
          <Stack.Screen name="finance" />
          <Stack.Screen name="weather" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="account-settings" />
          <Stack.Screen name="privacy-security" />
          <Stack.Screen name="help-support" />
          <Stack.Screen name="farmers-map" />
          <Stack.Screen name="my-orders" />
          <Stack.Screen name="my-products" />
          <Stack.Screen name="search" />
        </Stack>
        <AuthModal />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#1B5E20",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#FBC02D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#FBC02D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 20,
  },
  loaderContainer: {
    width: "60%",
    marginBottom: 40,
  },
  loaderBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "#FBC02D",
    borderRadius: 2,
  },
  splashVersion: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },
});
