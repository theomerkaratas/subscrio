import "../../global.css"
import { Text, View, TouchableOpacity, Alert, Image } from 'react-native'
import React from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import images from "@/constants/images";
import dayjs from "dayjs";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
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
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-4">
          Account
        </Text>
        
        {/* Profile Row */}
        <View className="flex-row items-center gap-4 mb-4">
          <Image 
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
            className="w-14 h-14 rounded-full" 
          />
          <View className="flex-1 gap-1">
            <Text className="text-lg font-sans-bold text-primary" numberOfLines={1} ellipsizeMode="tail">
              {user?.fullName || user?.firstName || "Anonymous"}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground" numberOfLines={1} ellipsizeMode="tail">
              {user?.primaryEmailAddress?.emailAddress || "—"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border mb-4" />

        {/* Details List */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-semibold text-muted-foreground">Account ID</Text>
            <Text 
              selectable={true} 
              className="text-sm font-sans-medium text-primary" 
              numberOfLines={1} 
              ellipsizeMode="middle"
              style={{ maxWidth: '60%' }}
            >
              {user?.id || "—"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-semibold text-muted-foreground">Joined Date</Text>
            <Text className="text-sm font-sans-medium text-primary">
              {user?.createdAt ? dayjs(user.createdAt).format("MMMM D, YYYY") : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign out button */}
      <TouchableOpacity
        onPress={handleSignOut}
        activeOpacity={0.8}
        className="items-center rounded-2xl bg-accent py-4"
      >
        <Text className="text-base font-sans-bold text-primary">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Settings