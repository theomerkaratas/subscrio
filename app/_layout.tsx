import "../global.css"
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

function InitialLayout() {
  const { isLoaded } = useAuth();
  const [fontsLoaded] = useFonts({
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf')
  });

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SubscriptionProvider>
        <InitialLayout />
      </SubscriptionProvider>
    </ClerkProvider>
  );
}
