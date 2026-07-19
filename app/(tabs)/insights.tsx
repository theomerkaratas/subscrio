import '../../global.css';
import React from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import InsightsBarChart, { BarChartDataPoint } from '@/components/InsightsBarChart';
import InsightsHistoryCard, { InsightsHistoryItem } from '@/components/InsightsHistoryCard';
import SpendingAreaChart from '@/components/SpendingAreaChart';
import { useSubscriptions } from '@/context/SubscriptionContext';

const SafeAreaView = styled(RNSafeAreaView);

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHART_DATA: BarChartDataPoint[] = [
  { label: 'Mon', value: 35 },
  { label: 'Tue', value: 30 },
  { label: 'Wed', value: 20 },
  { label: 'Thr', value: 40, highlighted: true },
  { label: 'Fri', value: 32 },
  { label: 'Sat', value: 15 },
  { label: 'Sun', value: 22 },
];

const HISTORY_ITEMS: InsightsHistoryItem[] = [
  {
    id: 'claude-pro',
    icon: icons.claude,
    name: 'Claude',
    date: 'June 25, 12:00',
    price: 9.84,
    currency: 'USD',
    billingPeriod: 'per month',
  },
  {
    id: 'canva-pro',
    icon: icons.canva,
    name: 'Canva',
    date: 'June 30, 16:00',
    price: 43.89,
    currency: 'USD',
    billingPeriod: 'per month',
  },
];

const EXPENSES = {
  total: 424.63,
  dateRange: 'March 2026',
  percentChange: '+12%',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const MonthlyInsights = () => {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="insights-header">
        {/* Back button */}
        <Pressable
          className="insights-header-btn"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Image source={icons.back} className="insights-header-icon" resizeMode="contain" />
        </Pressable>

        {/* Title */}
        <Text className="insights-header-title">Monthly Insights</Text>

        {/* Context menu — TODO: implement sheet/modal with export & filter options */}
        <Pressable
          className="insights-header-btn"
          accessibilityRole="button"
          accessibilityLabel="More options"
          disabled
          style={{ opacity: 0.4 }}
        >
          <Image source={icons.menu} className="insights-header-icon" resizeMode="contain" />
        </Pressable>
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="insights-scroll-content"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upcoming section ──────────────────────────────────────── */}
        <View className="insights-section-head">
          <Text className="insights-section-title">Upcoming</Text>
          {/* TODO: navigate to a dedicated upcoming-charges screen when it exists */}
          <Pressable
            className="insights-view-all-btn"
            accessibilityRole="button"
            accessibilityLabel="View all upcoming"
            disabled
            style={{ opacity: 0.4 }}
          >
            <Text className="insights-view-all-text">View all</Text>
          </Pressable>
        </View>

        {/* Bar chart */}
        <View className="insights-chart-card">
          <InsightsBarChart
            data={CHART_DATA}
            maxValue={45}
            yAxisSteps={[0, 5, 25, 35, 45]}
          />
        </View>

        {/* ── Expenses summary card ─────────────────────────────────── */}
        <View className="insights-expenses-card">
          <View className="insights-expenses-left">
            <Text className="insights-expenses-label">Expenses</Text>
            <Text className="insights-expenses-date">{EXPENSES.dateRange}</Text>
          </View>
          <View className="insights-expenses-right">
            <Text className="insights-expenses-amount">
              -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(EXPENSES.total)}
            </Text>
            <Text className="insights-expenses-change">{EXPENSES.percentChange}</Text>
          </View>
        </View>

        {/* ── Spending Over Time section ─────────────────────────── */}
        <Text className="insights-section-title insights-area-section-title">
          Spending Over Time
        </Text>
        <SpendingAreaChart subscriptions={subscriptions} />

        {/* ── History section ───────────────────────────────────────── */}
        <View className="insights-section-head">
          <Text className="insights-section-title">History</Text>
          {/* TODO: navigate to a dedicated payment-history screen when it exists */}
          <Pressable
            className="insights-view-all-btn"
            accessibilityRole="button"
            accessibilityLabel="View all history"
            disabled
            style={{ opacity: 0.4 }}
          >
            <Text className="insights-view-all-text">View all</Text>
          </Pressable>
        </View>

        {/* History list */}
        <View className="insights-history-list">
          {HISTORY_ITEMS.map((item) => (
            <InsightsHistoryCard key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MonthlyInsights;