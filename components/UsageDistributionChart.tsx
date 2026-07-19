import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type UsageDistributionChartProps = {
  data: {
    low: number;
    medium: number;
    high: number;
  };
  title?: string;
};

const UsageDistributionChart = ({ data, title = "Current Month Distribution" }: UsageDistributionChartProps) => {
  const { isDark } = useTheme();
  const total = data.low + data.medium + data.high;

  const lowPct = total > 0 ? Math.round((data.low / total) * 100) : 0;
  const mediumPct = total > 0 ? Math.round((data.medium / total) * 100) : 0;
  const highPct = total > 0 ? Math.round((data.high / total) * 100) : 0;

  return (
    <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-6">
      <Text className="text-lg font-sans-bold text-primary dark:text-[#f0ede4] mb-4">
        {title}
      </Text>

      {total === 0 ? (
        <View className="py-8 justify-center items-center">
          <Text className="text-sm font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">
            No active subscriptions with usage logs.
          </Text>
        </View>
      ) : (
        <View>
          {/* Stacked Proportional Bar */}
          <View className="h-4 w-full flex-row rounded-full overflow-hidden bg-muted dark:bg-[#0f1117] mb-6">
            {data.high > 0 && (
              <View 
                style={{ width: `${(data.high / total) * 100}%` }}
                className="h-full bg-[#10b981]" 
              />
            )}
            {data.medium > 0 && (
              <View 
                style={{ width: `${(data.medium / total) * 100}%` }}
                className="h-full bg-[#3b82f6]" 
              />
            )}
            {data.low > 0 && (
              <View 
                style={{ width: `${(data.low / total) * 100}%` }}
                className="h-full bg-[#f59e0b]" 
              />
            )}
          </View>

          {/* Stats Legend Grid */}
          <View className="flex-row gap-3">
            {/* High Usage */}
            <View className="flex-1 rounded-2xl border border-border dark:border-[rgba(255,255,255,0.05)] bg-[#10b981]/10 dark:bg-[#10b981]/5 p-3 items-center">
              <View className="w-2 h-2 rounded-full bg-[#10b981] mb-1" />
              <Text className="text-[10px] font-sans-semibold uppercase tracking-[0.5px] text-[#10b981]">
                High
              </Text>
              <Text className="text-lg font-sans-bold text-[#10b981] mt-1">
                {data.high}
              </Text>
              <Text className="text-[11px] font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.45)] mt-0.5">
                {highPct}% of total
              </Text>
            </View>

            {/* Medium Usage */}
            <View className="flex-1 rounded-2xl border border-border dark:border-[rgba(255,255,255,0.05)] bg-[#3b82f6]/10 dark:bg-[#3b82f6]/5 p-3 items-center">
              <View className="w-2 h-2 rounded-full bg-[#3b82f6] mb-1" />
              <Text className="text-[10px] font-sans-semibold uppercase tracking-[0.5px] text-[#3b82f6]">
                Medium
              </Text>
              <Text className="text-lg font-sans-bold text-[#3b82f6] mt-1">
                {data.medium}
              </Text>
              <Text className="text-[11px] font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.45)] mt-0.5">
                {mediumPct}% of total
              </Text>
            </View>

            {/* Low Usage */}
            <View className="flex-1 rounded-2xl border border-border dark:border-[rgba(255,255,255,0.05)] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/5 p-3 items-center">
              <View className="w-2 h-2 rounded-full bg-[#f59e0b] mb-1" />
              <Text className="text-[10px] font-sans-semibold uppercase tracking-[0.5px] text-[#f59e0b]">
                Low
              </Text>
              <Text className="text-lg font-sans-bold text-[#f59e0b] mt-1">
                {data.low}
              </Text>
              <Text className="text-[11px] font-sans-medium text-muted-foreground dark:text-[rgba(255,255,255,0.45)] mt-0.5">
                {lowPct}% of total
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default UsageDistributionChart;
