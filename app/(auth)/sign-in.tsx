import "../../global.css"
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { styled } from "nativewind";
import type { Href } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { usePostHog } from "posthog-react-native";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isDark } = useTheme();
  const posthog = usePostHog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const placeholderColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.35)";

  const handleSignIn = async () => {
    if (!signIn) return;

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize();
      posthog.capture('user_signed_in', {
        method: 'email',
      });
    }
  };

  const isFetching = fetchStatus === "fetching";
  const emailError = errors?.fields?.identifier?.message;
  const passwordError = errors?.fields?.password?.message;
  const globalError = !emailError && !passwordError ? errors?.global?.[0]?.message : undefined;

  return (
    <StyledSafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StyledScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            {/* Brand */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Subscrio</Text>
                  <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">Sign in to your account to continue</Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email or Username */}
                <View className="auth-field">
                  <Text className="auth-label">Email or Username</Text>
                  <TextInput
                    className={`auth-input${emailError ? " auth-input-error" : ""}`}
                    placeholder="Email or username"
                    placeholderTextColor={placeholderColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    value={email}
                    onChangeText={setEmail}
                  />
                  {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input${passwordError ? " auth-input-error" : ""}`}
                    placeholder="••••••••"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry
                    textContentType="password"
                    value={password}
                    onChangeText={setPassword}
                  />
                  {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                </View>

                {/* Global error */}
                {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                {/* Submit */}
                <TouchableOpacity
                  className={`auth-button${isFetching ? " auth-button-disabled" : ""}`}
                  onPress={handleSignIn}
                  disabled={isFetching}
                  activeOpacity={0.8}
                >
                  <Text className="auth-button-text">
                    {isFetching ? "Signing in…" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">{"Don't have an account?"}</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="auth-link">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </StyledScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}