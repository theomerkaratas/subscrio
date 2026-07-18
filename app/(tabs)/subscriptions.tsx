import "../../global.css"
import { Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React, { useState, useMemo } from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HOME_SUBSCRIPTIONS;
    return HOME_SUBSCRIPTIONS.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.category?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q) ||
        sub.status?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Screen Header — outside FlatList so it never remounts */}
      <View className="subs-screen-header">
        <Text className="subs-screen-title">Subscriptions</Text>
        <View className="subs-screen-count">
          <Text className="subs-screen-count-text">
            {filtered.length} of {HOME_SUBSCRIPTIONS.length}
          </Text>
        </View>
      </View>

      {/* Search Bar — outside FlatList so TextInput keeps focus on every keystroke */}
      <View className="subs-search-wrap">
        <Text className="text-base">🔍</Text>
        <TextInput
          className="subs-search-input"
          placeholder="Search by name, category…"
          placeholderTextColor="rgba(0,0,0,0.35)"
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