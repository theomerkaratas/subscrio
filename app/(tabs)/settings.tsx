import "../../global.css"
import { Text, View, TouchableOpacity, Alert, Image, Switch, ScrollView } from 'react-native'
import React from 'react'
import { styled } from "nativewind"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"
import { useAuth, useUser } from "@clerk/expo"
import { useRouter } from "expo-router"
import images from "@/constants/images"
import dayjs from "dayjs"
import { useTheme } from "@/context/ThemeContext"
import { useSubscriptions } from "@/context/SubscriptionContext"
import clsx from "clsx"

const SafeAreaView = styled(RNSafeAreaView)

const CURRENCIES = ["USD", "EUR", "TRY", "JPY"]

import { EXCHANGE_RATES } from "@/lib/utils"

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { currency, updateCurrency, isDemoMode, setDemoMode } = useSubscriptions()

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
            router.replace("/(auth)/sign-in")
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign out right now."
            Alert.alert("Sign Out Failed", message)
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117]" edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
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

      {/* Currency section */}
      <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)] mb-4">
          Preferences
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-base font-sans-semibold text-primary dark:text-[#f0ede4] mb-3">
              Currency
            </Text>
            <View className="flex-row gap-2">
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => updateCurrency(cur)}
                  className={clsx(
                    "flex-1 items-center justify-center py-2 rounded-xl border",
                    currency === cur 
                      ? "bg-accent border-accent" 
                      : "bg-transparent border-border dark:border-[rgba(255,255,255,0.1)]"
                  )}
                >
                  <Text className={clsx(
                    "text-sm font-sans-bold",
                    currency === cur ? "text-primary dark:text-[#0f1117]" : "text-muted-foreground"
                  )}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Currency Exchange section */}
      <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)] mb-4">
          Currency Exchange
        </Text>

        <View className="gap-4">
          {EXCHANGE_RATES.map((item, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-sans-semibold text-primary dark:text-[#f0ede4]">
                  1 {item.from}
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground">=</Text>
                <Text className="text-base font-sans-bold text-accent">
                  {item.rate.toFixed(2)} {item.to}
                </Text>
              </View>
            </View>
          ))}
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

      {/* Demo Mode section */}
      <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-4">
        <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)] mb-4">
          Development
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="gap-1 flex-1 pr-4">
            <Text className="text-base font-sans-semibold text-primary dark:text-[#f0ede4]">
              Demo Mode
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">
              Populate the app with realistic dummy data for testing.
            </Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={setDemoMode}
            trackColor={{ false: "rgba(0,0,0,0.15)", true: "#ea7a53" }}
            thumbColor="#ffffff"
            ios_backgroundColor="rgba(0,0,0,0.15)"
            accessibilityLabel="Toggle demo mode"
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

      {/* Bottom Spacer */}
      <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings