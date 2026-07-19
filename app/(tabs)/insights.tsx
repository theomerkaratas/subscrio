import '../../global.css';
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';
import InsightsBarChart, { BarChartDataPoint } from '@/components/InsightsBarChart';
import InsightsHistoryCard, { InsightsHistoryItem } from '@/components/InsightsHistoryCard';
import SpendingBarChart from '@/components/SpendingAreaChart';
import { convertAmount } from '@/lib/utils';
import { useSubscriptions } from '@/context/SubscriptionContext';

const SafeAreaView = styled(RNSafeAreaView);

// ─── Screen ───────────────────────────────────────────────────────────────────

const MonthlyInsights = () => {
  const { subscriptions, currency } = useSubscriptions();
  const [selectedDayIndex, setSelectedDayIndex] = React.useState<number | null>(dayjs().day());

  // ─── Generate data from subscriptions ───────────────────────────────
  
  // Bar chart data: Group spending by day of week for current month
  const CHART_DATA: BarChartDataPoint[] = React.useMemo(() => {
    if (subscriptions.length === 0) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = dayjs();
    const currentMonthSubs = subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      const date = sub.renewalDate || sub.startDate;
      // In demo mode, "current month" for insights might be different, but let's stick to system now.
      return date && dayjs(date).isSame(now, 'month');
    });

    const spendingByDay = new Array(7).fill(0);
    currentMonthSubs.forEach(sub => {
      const monthKey = now.format('YYYY-MM');
      let price = sub.price;
      
      if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
        const adjustment = sub.monthlyAdjustments[monthKey];
        if (adjustment === 'skip') {
          return; // Skip this subscription for this month
        }
        if (typeof adjustment === 'number') price = adjustment;
      }

      const date = sub.renewalDate || sub.startDate;
      const day = dayjs(date).day();
      spendingByDay[day] += price;
    });

    return days.map((label, index) => ({
      label,
      value: spendingByDay[index],
    }));
  }, [subscriptions]);

  const SELECTED_DAY_SUBS = React.useMemo(() => {
    if (selectedDayIndex === null) return [];
    const now = dayjs();
    const monthKey = now.format('YYYY-MM');
    
    return subscriptions
      .filter(sub => {
        if (sub.status !== 'active') return false;
        const date = sub.renewalDate || sub.startDate;
        if (!date) return false;
        const subDate = dayjs(date);
        if (!subDate.isSame(now, 'month')) return false;
        if (subDate.day() !== selectedDayIndex) return false;
        
        if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
          return sub.monthlyAdjustments[monthKey] !== 'skip';
        }
        return true;
      })
      .map(sub => {
        let price = sub.price;
        if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
          const adj = sub.monthlyAdjustments[monthKey];
          if (typeof adj === 'number') price = adj;
        }
        const date = sub.renewalDate || sub.startDate;
        return {
          id: sub.id,
          icon: sub.icon,
          name: sub.name,
          date: dayjs(date).format('MMMM D, HH:mm'),
          price: convertAmount(price, "USD", currency),
          currency,
          billingPeriod: sub.billing === 'One-time' ? 'One-time' : `per ${sub.billing.toLowerCase().replace('ly', '')}`,
        };
      });
  }, [subscriptions, selectedDayIndex, currency]);

  const HISTORY_ITEMS: InsightsHistoryItem[] = React.useMemo(() => {
    const now = dayjs();
    const monthKey = now.format('YYYY-MM');

    return subscriptions
      .filter(sub => {
        if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
          return sub.monthlyAdjustments[monthKey] !== 'skip';
        }
        return true;
      })
      .slice(0, 5)
      .map(sub => {
        let price = sub.price;
        if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
          const adj = sub.monthlyAdjustments[monthKey];
          if (typeof adj === 'number') price = adj;
        }
        return {
          id: sub.id,
          icon: sub.icon,
          name: sub.name,
          date: sub.renewalDate ? dayjs(sub.renewalDate).format('MMMM D, HH:mm') : sub.startDate ? dayjs(sub.startDate).format('MMMM D, HH:mm') : 'Recently',
          price: price,
          currency: sub.currency || 'USD',
          billingPeriod: sub.billing === 'One-time' ? 'One-time' : `per ${sub.billing.toLowerCase().replace('ly', '')}`,
        };
      });
  }, [subscriptions]);

  const EXPENSES = React.useMemo(() => {
    const now = dayjs();
    const monthKey = now.format('YYYY-MM');
    const total = subscriptions.reduce((acc, sub) => {
      if (sub.status !== 'active') return acc;
      const date = sub.renewalDate || sub.startDate;
      if (!date || !dayjs(date).isSame(now, 'month')) return acc;

      let price = sub.price;
      if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
        const adjustment = sub.monthlyAdjustments[monthKey];
        if (adjustment === 'skip') return acc;
        if (typeof adjustment === 'number') price = adjustment;
      }
      return acc + price;
    }, 0);
    return {
      total,
      dateRange: now.format('MMMM YYYY'),
      percentChange: subscriptions.length > 0 ? '+12%' : '0%', // Mock change for POC
    };
  }, [subscriptions]);

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
          {CHART_DATA.length > 0 ? (
            <InsightsBarChart
              data={CHART_DATA}
              maxValue={45}
              yAxisSteps={[0, 5, 25, 35, 45]}
              selectedIndex={selectedDayIndex}
              onBarPress={(index) => {
                if (selectedDayIndex === index) {
                  setSelectedDayIndex(null);
                } else {
                  setSelectedDayIndex(index);
                }
              }}
            />
          ) : (
            <View className="h-[200px] justify-center items-center">
              <Text className="text-muted-foreground">No chart data available</Text>
            </View>
          )}
        </View>

        {/* Selected day breakdown */}
        {selectedDayIndex !== null && (
          <View className="mb-6 px-5">
            <Text className="insights-section-title mb-3">
              Due on {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDayIndex]}
            </Text>
            <View className="gap-3">
              {SELECTED_DAY_SUBS.length > 0 ? (
                SELECTED_DAY_SUBS.map((item) => (
                  <InsightsHistoryCard key={item.id} {...item} />
                ))
              ) : (
                <View className="insights-history-card bg-card border border-border justify-center py-4">
                  <Text className="text-muted-foreground text-center">No payments due this day</Text>
                </View>
              )}
            </View>
          </View>
        )}

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
        {subscriptions.length > 0 ? (
          <SpendingBarChart subscriptions={subscriptions} />
        ) : (
          <View className="h-[200px] justify-center items-center bg-card rounded-2xl mx-5 mb-5 border border-muted dark:border-white/10">
            <Text className="text-muted-foreground">Add subscriptions to see trends</Text>
          </View>
        )}

        {/* ── History section ───────────────────────────────────────── */}
        <View className="insights-section-head">
          <Text className="insights-section-title">History</Text>
        </View>

        {/* History list */}
        <View className="insights-history-list">
          {historyConverted.length > 0 ? (
            historyConverted.map((item) => (
              <InsightsHistoryCard key={item.id} {...item} />
            ))
          ) : (
            <Text className="text-center text-muted-foreground py-5">No history yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MonthlyInsights;