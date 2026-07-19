import "../../global.css"
import { Text, View, TouchableOpacity, Alert, Image, Switch } from 'react-native'
import React from 'react'
import { styled } from "nativewind"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"
import { useAuth, useUser } from "@clerk/expo"
import { useRouter } from "expo-router"
import images from "@/constants/images"
import dayjs from "dayjs"
import { useTheme } from "@/context/ThemeContext"

const SafeAreaView = styled(RNSafeAreaView)

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.replace("/(auth)/sign-in")
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117] p-5">
      <Text className="text-2xl font-sans-bold text-primary dark:text-[#f0ede4] mb-6">Settings</Text>

      {/* Account section */}
      <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)] mb-4">
          Account
        </Text>

        {/* Profile Row */}
        <View className="flex-row items-center gap-4 mb-4">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="w-14 h-14 rounded-full"
          />
          <View className="flex-1 gap-1">
            <Text className="text-lg font-sans-bold text-primary dark:text-[#f0ede4]" numberOfLines={1} ellipsizeMode="tail">
              {user?.fullName || user?.firstName || "Anonymous"}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.55)]" numberOfLines={1} ellipsizeMode="tail">
              {user?.primaryEmailAddress?.emailAddress || "—"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border dark:bg-[rgba(255,255,255,0.1)] mb-4" />

        {/* Details List */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-semibold text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">Account ID</Text>
            <Text
              selectable={true}
              className="text-sm font-sans-medium text-primary dark:text-[#f0ede4]"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={{ maxWidth: '60%' }}
            >
              {user?.id || "—"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-semibold text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">Joined Date</Text>
            <Text className="text-sm font-sans-medium text-primary dark:text-[#f0ede4]">
              {user?.createdAt ? dayjs(user.createdAt).format("MMMM D, YYYY") : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Appearance section */}
      <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)] mb-4">
          Appearance
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-base font-sans-semibold text-primary dark:text-[#f0ede4]">
              Dark Mode
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">
              {isDark ? "Currently on" : "Currently off"}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "rgba(0,0,0,0.15)", true: "#ea7a53" }}
            thumbColor="#ffffff"
            ios_backgroundColor="rgba(0,0,0,0.15)"
            accessibilityLabel="Toggle dark mode"
            accessibilityRole="switch"
          />
        </View>
      </View>

      {/* Sign out button */}
      <TouchableOpacity
        onPress={handleSignOut}
        activeOpacity={0.8}
        className="items-center rounded-2xl bg-accent py-4"
      >
        <Text className="text-base font-sans-bold text-primary dark:text-[#0f1117]">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Settings