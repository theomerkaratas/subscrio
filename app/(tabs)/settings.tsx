import "../../global.css"
import { Text, View, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          posthog.capture('user_signed_out');
          posthog.reset();
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>

      {/* Account section */}
      <View className="rounded-3xl border border-border bg-card p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-3">
          Account
        </Text>
        <View className="gap-1">
          <Text className="text-base font-sans-semibold text-primary">
            {user?.fullName || user?.firstName || "—"}
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress || "—"}
          </Text>
        </View>
      </View>

      {/* Sign out button */}
      <TouchableOpacity
        onPress={handleSignOut}
        activeOpacity={0.8}
        className="items-center rounded-2xl bg-primary py-4"
      >
        <Text className="text-base font-sans-bold text-background">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Settings