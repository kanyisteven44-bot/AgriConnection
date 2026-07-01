import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";

export default function Index() {
  const { auth, isReady } = useAuth();

  if (!isReady) return null;

  // Always go to tabs - auth is optional
  return <Redirect href="/(tabs)" />;
}
