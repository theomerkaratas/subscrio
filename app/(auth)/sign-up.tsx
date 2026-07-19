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
import { useSignUp } from "@clerk/expo/legacy";
import { styled } from "nativewind";
import { useTheme } from "@/context/ThemeContext";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

export default function SignUp() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isDark } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const placeholderColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.35)";

  const [isFetching, setIsFetching] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined);
  const [lastNameError, setLastNameError] = useState<string | undefined>(undefined);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setIsFetching(true);
    setFirstNameError(undefined);
    setLastNameError(undefined);
    setUsernameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setGlobalError(undefined);

    try {
      await signUp.create({
        username,
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      console.error("Sign-up error:", JSON.stringify(err, null, 2));
      
      const hasIdentifierConflict = err?.errors?.some(
        (e: any) => e.code === "form_identifier_exists"
      );

      if (hasIdentifierConflict) {
        setGlobalError("Username or email is incorrect, or the password is not suitable.");
        return;
      }

      const clerkError = err?.errors?.[0];
      if (clerkError) {
        if (clerkError.meta?.paramName === "first_name") {
          setFirstNameError(clerkError.message);
        } else if (clerkError.meta?.paramName === "last_name") {
          setLastNameError(clerkError.message);
        } else if (clerkError.meta?.paramName === "username") {
          setUsernameError(clerkError.message);
        } else if (clerkError.meta?.paramName === "email_address") {
          setEmailError(clerkError.message);
        } else if (clerkError.meta?.paramName === "password") {
          setPasswordError(clerkError.message);
        } else {
          setGlobalError(clerkError.message);
        }
      } else {
        setGlobalError("An unexpected error occurred during sign-up.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp || !setActive) return;
    setIsFetching(true);
    setCodeError(undefined);
    setGlobalError(undefined);

    try {
      console.log("Attempting email address verification...");
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification response:", JSON.stringify(completeSignUp, null, 2));

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.warn("Sign-up status is not complete:", completeSignUp.status);
        console.warn("Unverified fields:", completeSignUp.unverifiedFields);
        console.warn("Missing fields:", completeSignUp.missingFields);

        // Build detailed explanation of what is incomplete or missing
        const missing = completeSignUp.missingFields && completeSignUp.missingFields.length > 0
          ? `Missing fields: ${completeSignUp.missingFields.join(", ")}`
          : "";
        const unverified = completeSignUp.unverifiedFields && completeSignUp.unverifiedFields.length > 0
          ? `Unverified fields: ${completeSignUp.unverifiedFields.join(", ")}`
          : "";
        const details = [missing, unverified].filter(Boolean).join(". ");

        setGlobalError(
          `Sign-up incomplete (Status: ${completeSignUp.status}). ${details || "Please check your Clerk Dashboard settings."}`
        );
      }
    } catch (err: any) {
      console.error("Verification failed with error:", err);
      if (err.errors && err.errors.length > 0) {
        err.errors.forEach((e: any, index: number) => {
          console.error(`Clerk Error ${index}: Code=${e.code}, Message=${e.message}, LongMessage=${e.longMessage}`);
        });
      }

      const hasIdentifierConflict = err?.errors?.some(
        (e: any) => e.code === "form_identifier_exists"
      );

      if (hasIdentifierConflict) {
        setGlobalError("Username or email is incorrect, or the password is not suitable.");
        return;
      }

      const clerkError = err?.errors?.[0];
      if (clerkError) {
        if (clerkError.meta?.paramName === "code") {
          setCodeError(clerkError.longMessage || clerkError.message);
        } else {
          setGlobalError(clerkError.longMessage || clerkError.message);
        }
      } else if (err.message) {
        setGlobalError(err.message);
      } else {
        setGlobalError("An unexpected error occurred during verification.");
      }
    } finally {
      setIsFetching(false);
    }
  };

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
                  {/* First Name */}
                  <View className="auth-field">
                    <Text className="auth-label">First Name</Text>
                    <TextInput
                      className={`auth-input${firstNameError ? " auth-input-error" : ""}`}
                      placeholder="Jane"
                      placeholderTextColor={placeholderColor}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                    {firstNameError ? <Text className="auth-error">{firstNameError}</Text> : null}
                  </View>

                  {/* Last Name */}
                  <View className="auth-field">
                    <Text className="auth-label">Last Name</Text>
                    <TextInput
                      className={`auth-input${lastNameError ? " auth-input-error" : ""}`}
                      placeholder="Doe"
                      placeholderTextColor={placeholderColor}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                    {lastNameError ? <Text className="auth-error">{lastNameError}</Text> : null}
                  </View>

                  {/* Username */}
                  <View className="auth-field">
                    <Text className="auth-label">Username</Text>
                    <TextInput
                      className={`auth-input${usernameError ? " auth-input-error" : ""}`}
                      placeholder="Choose a username"
                      placeholderTextColor={placeholderColor}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={username}
                      onChangeText={setUsername}
                    />
                    {usernameError ? <Text className="auth-error">{usernameError}</Text> : null}
                  </View>

                  {/* Email */}
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input${emailError ? " auth-input-error" : ""}`}
                      placeholder="you@example.com"
                      placeholderTextColor={placeholderColor}
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
                      placeholderTextColor={placeholderColor}
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
                      placeholderTextColor={placeholderColor}
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
                    onPress={() => {
                      setIsFetching(true);
                      signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
                        .catch((err) => {
                          console.error("Resend error:", err);
                          const clerkError = err?.errors?.[0];
                          if (clerkError) {
                            setGlobalError(clerkError.message);
                          } else {
                            setGlobalError("Failed to resend verification code.");
                          }
                        })
                        .finally(() => setIsFetching(false));
                    }}
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