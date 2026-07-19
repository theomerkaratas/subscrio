import "../global.css"
import { SplashScreen, Stack, useRouter, useSegments, usePathname, useGlobalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthog } from "@/src/config/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env.local file");
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const ph = usePostHog();

  const [fontsLoaded] = useFonts({
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf')
  });

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      ph.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params, ph]);

  // Identify user when signed in, reset on sign-out
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      ph.identify(user.id, {
        $set: {
          username: user.username ?? null,
          first_name: user.firstName ?? null,
          last_name: user.lastName ?? null,
        },
        $set_once: {
          first_seen_at: user.createdAt?.toISOString() ?? null,
        },
      });
    }
  }, [isSignedIn, isLoaded, user, ph]);

  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (isSignedIn) {
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    } else {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [isSignedIn, isLoaded, fontsLoaded, segments, router]);

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
    <ThemeProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SubscriptionProvider>
          <PostHogProvider
            client={posthog}
            autocapture={{
              captureScreens: false,
              captureTouches: true,
              propsToCapture: ["testID"],
              maxElementsCaptured: 20,
            }}
          >
            <InitialLayout />
          </PostHogProvider>
        </SubscriptionProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
