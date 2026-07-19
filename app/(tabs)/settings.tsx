import "../../global.css"
import { Text, View, TouchableOpacity, Alert, Image, Switch, ScrollView, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { styled } from "nativewind"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"
import { useAuth, useUser } from "@clerk/expo"
import { useRouter } from "expo-router"
import images from "@/constants/images"
import dayjs from "dayjs"
import { useTheme } from "@/context/ThemeContext"
import { useSubscriptions } from "@/context/SubscriptionContext"
import clsx from "clsx"
import { useClerkMetadata } from "@/hooks/useClerkMetadata"
import { EXCHANGE_RATES } from "@/lib/utils"
import * as ImagePicker from 'expo-image-picker'
import { usePostHog } from "posthog-react-native"

const SafeAreaView = styled(RNSafeAreaView)

const CURRENCIES = ["USD", "EUR", "TRY", "JPY"]

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { currency, updateCurrency, isDemoMode, setDemoMode } = useSubscriptions()
  const { subscription } = useClerkMetadata()
  const posthog = usePostHog()

  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
    }
  }, [user])

  const onPickImage = async () => {
    if (!user) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        setIsUploading(true);
        const base64 = result.assets[0].base64;
        const mimeType = result.assets[0].mimeType || 'image/jpeg';
        const file = `data:${mimeType};base64,${base64}`;

        await user.setProfileImage({
          file,
        });
        await user.reload();
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (err: any) {
      console.error("Error updating profile image:", err);
      const errMsg = err?.errors?.[0]?.message || err?.message || "Could not upload image.";
      Alert.alert("Error", errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await user.reload();
      posthog.capture('profile_updated', {
        updated_fields: ['first_name', 'last_name'].filter(Boolean),
      });
      Alert.alert("Success", "Profile information updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile name:", err);
      const errMsg = err?.errors?.[0]?.message || err?.message || "Could not update profile information.";
      Alert.alert("Error", errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            posthog.capture('user_signed_out')
            posthog.reset()
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
          <TouchableOpacity onPress={onPickImage} disabled={isUploading} className="relative">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="w-14 h-14 rounded-full"
            />
            <View className="absolute inset-0 bg-black/40 rounded-full justify-center items-center">
              <Text className="text-[9px] text-white font-sans-bold text-center">
                {isUploading ? "..." : "Edit"}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-1 gap-1">
            <Text className="text-lg font-sans-bold text-primary dark:text-[#f0ede4]" numberOfLines={1} ellipsizeMode="tail">
              {user?.fullName || user?.firstName || "Anonymous"}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.55)]" numberOfLines={1} ellipsizeMode="tail">
              {user?.username || user?.primaryEmailAddress?.emailAddress || "—"}
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


          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-semibold text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">Status</Text>
            <Text className="text-sm font-sans-bold capitalize text-primary dark:text-[#f0ede4]">
              {subscription.status}
              {subscription.endsAt ? ` (until ${dayjs(subscription.endsAt).format("MM/DD/YY")})` : ""}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border dark:bg-[rgba(255,255,255,0.1)] my-4" />

        {/* Edit Profile Info Form */}
        <View className="gap-3 mb-2">
          <Text className="text-xs font-sans-semibold uppercase tracking-[0.5px] text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">
            Update Name
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextInput
                className="bg-transparent border border-border dark:border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2.5 text-sm text-primary dark:text-[#f0ede4]"
                placeholder="First Name"
                placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <TextInput
                className="bg-transparent border border-border dark:border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2.5 text-sm text-primary dark:text-[#f0ede4]"
                placeholder="Last Name"
                placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={isSaving}
            activeOpacity={0.8}
            className="items-center rounded-xl bg-accent py-2.5"
          >
            <Text className="text-sm font-sans-bold text-primary dark:text-[#0f1117]">
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
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
                  onPress={() => {
                    posthog.capture('currency_changed', { from_currency: currency, to_currency: cur })
                    updateCurrency(cur)
                  }}
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
            onValueChange={(val) => {
              posthog.capture('theme_toggled', { theme: val ? 'dark' : 'light' })
              toggleTheme()
            }}
            trackColor={{ false: "rgba(0,0,0,0.15)", true: "#ea7a53" }}
            thumbColor="#ffffff"
            ios_backgroundColor="rgba(0,0,0,0.15)"
            accessibilityLabel="Toggle dark mode"
            accessibilityRole="switch"
          />
        </View>
      </View>

      {/* Demo Mode section */}
      {user?.username === "admin" && (
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
      )}

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