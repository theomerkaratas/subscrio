import "../../global.css"
import { Text, View, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useMemo } from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useTheme } from "@/context/ThemeContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions, cancelSubscription, updateSubscription } = useSubscriptions();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [cancellingIds, setCancellingIds] = useState<string[]>([]);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const handleCancel = (id: string, name?: string) => {
    if (!id) return;
    Alert.alert(
      "Cancel subscription",
      `Are you sure you want to cancel ${name || 'this subscription'}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            setCancellingIds((cur) => [...cur, id]);
            try {
              await cancelSubscription(id);
            } finally {
              setCancellingIds((cur) => cur.filter((x) => x !== id));
            }
          },
        },
      ]
    );
  };

  const handleChangePayment = (id: string) => {
    Alert.alert(
      "Change payment method",
      "Select a payment method:",
      [
        { text: "Card ****8530", onPress: () => updateSubscription(id, { paymentMethod: 'Card ****8530' }) },
        { text: "PayPal", onPress: () => updateSubscription(id, { paymentMethod: 'PayPal' }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleChangeCategory = (id: string) => {
    Alert.alert(
      "Change category",
      "Choose a category:",
      [
        { text: "Productivity", onPress: () => updateSubscription(id, { category: 'Productivity' }) },
        { text: "Utilities", onPress: () => updateSubscription(id, { category: 'Utilities' }) },
        { text: "Other", onPress: () => updateSubscription(id, { category: 'Other' }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleChangeStatus = (id: string) => {
    Alert.alert(
      "Change status",
      "Set subscription status:",
      [
        { text: "Active", onPress: () => updateSubscription(id, { status: 'active' }) },
        { text: "Paused", onPress: () => updateSubscription(id, { status: 'paused' }) },
        { text: "Cancelled", style: 'destructive', onPress: () => updateSubscription(id, { status: 'cancelled' }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.category?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q) ||
        sub.status?.toLowerCase().includes(q)
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117] p-5">
      {/* Screen Header — outside FlatList so it never remounts */}
      <View className="subs-screen-header">
        <Text className="subs-screen-title">Subscriptions</Text>
        <View className="subs-screen-count">
          <Text className="subs-screen-count-text">
            {filtered.length} of {subscriptions.length}
          </Text>
        </View>
      </View>

      {/* Search Bar — outside FlatList so TextInput keeps focus on every keystroke */}
      <View className="subs-search-wrap">
        <Text className="text-base">🔍</Text>
        <TextInput
          className="subs-search-input"
          placeholder="Search by name, category…"
          placeholderTextColor={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)"}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity
            className="subs-search-clear"
            onPress={() => setQuery("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text className="subs-search-clear-text">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((cur) =>
                cur === item.id ? null : item.id
              )
            }
            onCancelPress={() => handleCancel(item.id, item.name)}
            isCancelling={cancellingIds.includes(item.id)}
            onChangePayment={() => handleChangePayment(item.id)}
            onChangeCategory={() => handleChangeCategory(item.id)}
            onChangeStatus={() => handleChangeStatus(item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View className="subs-empty">
            <Text className="subs-empty-title">No results found</Text>
            <Text className="subs-empty-subtitle">
              Try a different name, category, or status
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Subscriptions