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
import { useSignUp } from "@clerk/expo";
import { styled } from "nativewind";
import type { Href } from "expo-router";
import { usePostHog } from "posthog-react-native";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

type NavigateArgs = { session: { currentTask?: unknown }; decorateUrl: (path: string) => string };

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const posthog = usePostHog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const navigateAfterAuth = ({ session, decorateUrl }: NavigateArgs) => {
    if (session?.currentTask) return;
    router.replace(decorateUrl("/") as Href);
  };

  const handleSignUp = async () => {
    if (!signUp) return;

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;

    // Send email verification code
    await signUp.verifications.sendEmailCode();

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address")
    ) {
      posthog.capture('email_verification_started');
      setVerifying(true);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      if (signUp.createdSessionId) {
        posthog.identify(signUp.createdSessionId);
      }
      posthog.capture('user_signed_up');
      await signUp.finalize({ navigate: navigateAfterAuth });
    }
  };

  const isFetching = fetchStatus === "fetching";
  const emailError = errors?.fields?.emailAddress?.message;
  const passwordError = errors?.fields?.password?.message;
  const codeError = errors?.fields?.code?.message;
  const globalError = !emailError && !passwordError && !codeError
    ? errors?.global?.[0]?.message
    : undefined;

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

              <Text className="auth-title">
                {verifying ? "Check your inbox" : "Create an account"}
              </Text>
              <Text className="auth-subtitle">
                {verifying
                  ? `We sent a 6-digit code to ${email}`
                  : "Start tracking your subscriptions today"}
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              {!verifying ? (
                <View className="auth-form">
                  {/* Email */}
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input${emailError ? " auth-input-error" : ""}`}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
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
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry
                      textContentType="newPassword"
                      value={password}
                      onChangeText={setPassword}
                    />
                    {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                  </View>

                  {/* Global error */}
                  {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                  {/* Captcha mount point — required by Clerk bot protection */}
                  <View nativeID="clerk-captcha" />

                  {/* Submit */}
                  <TouchableOpacity
                    className={`auth-button${isFetching ? " auth-button-disabled" : ""}`}
                    onPress={handleSignUp}
                    disabled={isFetching}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-button-text">
                      {isFetching ? "Creating account…" : "Create Account"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="auth-form">
                  {/* Verification code */}
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={`auth-input${codeError ? " auth-input-error" : ""}`}
                      placeholder="000000"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                    />
                    {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                  </View>

                  {/* Global error */}
                  {globalError ? <Text className="auth-error">{globalError}</Text> : null}

                  {/* Verify submit */}
                  <TouchableOpacity
                    className={`auth-button${isFetching ? " auth-button-disabled" : ""}`}
                    onPress={handleVerify}
                    disabled={isFetching}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-button-text">
                      {isFetching ? "Verifying…" : "Verify Email"}
                    </Text>
                  </TouchableOpacity>

                  {/* Resend */}
                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={() => signUp?.verifications.sendEmailCode()}
                    disabled={isFetching}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-secondary-button-text">Resend Code</Text>
                  </TouchableOpacity>

                  {/* Back */}
                  <TouchableOpacity
                    onPress={() => setVerifying(false)}
                    activeOpacity={0.7}
                  >
                    <Text className="auth-helper" style={{ textAlign: "center" }}>
                      ← Use a different email
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer */}
            {!verifying && (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity>
                    <Text className="auth-link">Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
          </View>
        </StyledScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}