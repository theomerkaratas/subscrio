import '../../global.css';
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants/icons';
import InsightsBarChart, { BarChartDataPoint } from '@/components/InsightsBarChart';
import InsightsHistoryCard, { InsightsHistoryItem } from '@/components/InsightsHistoryCard';
import SpendingAreaChart from '@/components/SpendingAreaChart';
import { convertAmount } from '@/lib/utils';
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
  const { subscriptions, currency } = useSubscriptions();

  const historyConverted = HISTORY_ITEMS.map(item => ({
    ...item,
    price: convertAmount(item.price, "USD", currency),
    currency
  }));

  const totalConverted = convertAmount(EXPENSES.total, "USD", currency);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="insights-header">
        {/* Title */}
        <Text className="insights-header-title">Monthly Insights</Text>
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
              -{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalConverted)}
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
        </View>

        {/* History list */}
        <View className="insights-history-list">
          {historyConverted.map((item) => (
            <InsightsHistoryCard key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MonthlyInsights;