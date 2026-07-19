import "../../global.css";
import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";

import { useSubscriptions } from "@/context/SubscriptionContext";
import { useTheme } from "@/context/ThemeContext";
import { formatCurrency } from "@/lib/utils";
import { usePostHog } from "posthog-react-native";
import UsageDistributionChart from "@/components/UsageDistributionChart";
import UsageTrendChart from "@/components/UsageTrendChart";

const SafeAreaView = styled(RNSafeAreaView);

const UsageScreen = () => {
  const { subscriptions, updateSubscription, currency } = useSubscriptions();
  const { isDark } = useTheme();
  const posthog = usePostHog();
  
  // State for tracking which month is selected for logging/viewing
  const [selectedMonthKey, setSelectedMonthKey] = React.useState(dayjs().format("YYYY-MM"));

  // Generate dynamic horizontal list of past 6 months
  const monthsList = React.useMemo(() => {
    const list = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      const m = now.subtract(i, "month");
      list.push({
        key: m.format("YYYY-MM"),
        label: m.format("MMM"), // e.g. "Jul"
        year: m.format("YYYY"), // e.g. "2026"
        fullLabel: m.format("MMMM YYYY"), // e.g. "July 2026"
      });
    }
    return list;
  }, []);

  const selectedMonthLabel = React.useMemo(() => {
    const match = monthsList.find((m) => m.key === selectedMonthKey);
    return match ? match.fullLabel : dayjs(selectedMonthKey).format("MMMM YYYY");
  }, [selectedMonthKey, monthsList]);

  // Get active subscriptions
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  );

  // Compute distribution data for the selected month
  const distributionData = React.useMemo(() => {
    let low = 0;
    let medium = 0;
    let high = 0;

    activeSubscriptions.forEach((sub) => {
      if (sub.usage && selectedMonthKey in sub.usage) {
        const val = sub.usage[selectedMonthKey];
        if (val === "high") high++;
        else if (val === "medium") medium++;
        else if (val === "low") low++;
      }
    });

    return { low, medium, high };
  }, [activeSubscriptions, selectedMonthKey]);

  // Handle setting/toggling usage level for the selected month
  const handleSelectUsage = async (subId: string, level: "low" | "medium" | "high") => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available on current platform
    }

    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    const currentUsage = sub.usage || {};
    const existingVal = currentUsage[selectedMonthKey];

    let nextUsage = { ...currentUsage };
    if (existingVal === level) {
      // Toggle off if clicking the active one
      delete nextUsage[selectedMonthKey];
    } else {
      nextUsage[selectedMonthKey] = level;
    }

    updateSubscription(subId, { usage: nextUsage });

    if (existingVal !== level) {
      posthog.capture('usage_logged', {
        subscription_name: sub.name,
        subscription_category: sub.category ?? null,
        usage_level: level,
        month: selectedMonthKey,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117]" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="insights-header">
        <Text className="insights-header-title">Utilization & Usage</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Picker Timeline */}
        <View className="mb-6">
          <Text className="text-xs font-sans-bold text-muted-foreground uppercase tracking-[0.8px] mb-3">
            Select Logging Month
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2"
          >
            {monthsList.map((m) => {
              const isSelected = m.key === selectedMonthKey;
              return (
                <TouchableOpacity
                  key={m.key}
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setSelectedMonthKey(m.key);
                  }}
                  className={`px-5 py-2.5 rounded-2xl border ${
                    isSelected
                      ? "bg-accent border-accent"
                      : "bg-card border-border dark:border-[rgba(255,255,255,0.08)] dark:bg-[#1a1d27]"
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-bold ${
                      isSelected ? "text-primary dark:text-[#0f1117]" : "text-muted-foreground"
                    }`}
                  >
                    {m.label} {m.year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Month Distribution Chart */}
        <UsageDistributionChart 
          data={distributionData} 
          title={`${selectedMonthLabel} Distribution`} 
        />

        {/* Historical Analytics & Trends Chart */}
        <UsageTrendChart subscriptions={subscriptions} />

        {/* List of active subscriptions to track usage */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-sans-bold text-primary dark:text-[#f0ede4]">
              Log Usage Level
            </Text>
            <View className="px-3 py-1 rounded-full bg-muted dark:bg-[#1a1d27] border border-border dark:border-white/5">
              <Text className="text-xs font-sans-semibold text-muted-foreground">
                {selectedMonthLabel}
              </Text>
            </View>
          </View>

          {activeSubscriptions.length === 0 ? (
            <View className="rounded-3xl border border-dashed border-border dark:border-[rgba(255,255,255,0.15)] p-8 items-center bg-card dark:bg-[#1a1d27]">
              <Text className="text-base font-sans-bold text-primary dark:text-[#f0ede4] text-center mb-1">
                No active subscriptions
              </Text>
              <Text className="text-xs font-sans-medium text-muted-foreground text-center">
                Go to the Home tab to add subscriptions and start logging utilization.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {activeSubscriptions.map((sub) => {
                const loggedUsage = sub.usage?.[selectedMonthKey];
                return (
                  <View
                    key={sub.id}
                    className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.08)] bg-card dark:bg-[#1a1d27] p-4 flex-col"
                  >
                    {/* Upper row: Details */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1 pr-2">
                        <View className="w-10 h-10 rounded-2xl bg-muted dark:bg-[#0f1117] items-center justify-center mr-3 overflow-hidden">
                          <Image
                            source={
                              typeof sub.icon === "string"
                                ? { uri: sub.icon }
                                : sub.icon || require("@/assets/icons/logo.png")
                            }
                            className="w-7 h-7"
                            resizeMode="contain"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-base font-sans-bold text-primary dark:text-[#f0ede4]"
                            numberOfLines={1}
                          >
                            {sub.name}
                          </Text>
                          <Text
                            className="text-xs font-sans-semibold text-muted-foreground uppercase tracking-[0.5px]"
                            numberOfLines={1}
                          >
                            {sub.category || "General"}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-base font-sans-bold text-primary dark:text-[#f0ede4]">
                          {formatCurrency(sub.price, sub.currency || currency)}
                        </Text>
                        <Text className="text-[10px] font-sans-semibold text-muted-foreground">
                          {sub.billing === "One-time" ? "One-time" : `per ${sub.billing.toLowerCase().replace("ly", "")}`}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] bg-border dark:bg-[rgba(255,255,255,0.06)] mb-3" />

                    {/* Lower row: Segmented selector */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-sans-semibold text-muted-foreground">
                        Utilization:
                      </Text>
                      <View className="flex-row bg-muted dark:bg-[#0f1117] rounded-2xl p-1 gap-1 flex-1 max-w-[210px]">
                        {/* Low Option */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleSelectUsage(sub.id, "low")}
                          className={`flex-1 py-2 rounded-xl items-center justify-center ${
                            loggedUsage === "low"
                              ? "bg-[#f59e0b]"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-xs font-sans-bold ${
                              loggedUsage === "low"
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            Low
                          </Text>
                        </TouchableOpacity>

                        {/* Medium Option */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleSelectUsage(sub.id, "medium")}
                          className={`flex-1 py-2 rounded-xl items-center justify-center ${
                            loggedUsage === "medium"
                              ? "bg-[#3b82f6]"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-xs font-sans-bold ${
                              loggedUsage === "medium"
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            Med
                          </Text>
                        </TouchableOpacity>

                        {/* High Option */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleSelectUsage(sub.id, "high")}
                          className={`flex-1 py-2 rounded-xl items-center justify-center ${
                            loggedUsage === "high"
                              ? "bg-[#10b981]"
                              : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-xs font-sans-bold ${
                              loggedUsage === "high"
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            High
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UsageScreen;
