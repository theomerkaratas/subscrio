import React from 'react';
import { View, Text, Pressable } from 'react-native';

export type BarChartDataPoint = {
  label: string;
  value: number;
  highlighted?: boolean;
};

type InsightsBarChartProps = {
  data: BarChartDataPoint[];
  maxValue?: number;
  yAxisSteps?: number[];
  onBarPress?: (index: number) => void;
  selectedIndex?: number | null;
};

const InsightsBarChart = ({ data, maxValue, yAxisSteps, onBarPress, selectedIndex }: InsightsBarChartProps) => {
  const rawMax = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
  const computedMax = maxValue ?? (Math.ceil(Math.max(rawMax, 0) / 5) * 5 || 1);
  const steps = yAxisSteps ?? [0, 5, 25, 35, 45];

  return (
    <View className="insights-chart-container">
      {/* Y-axis + bars area */}
      <View className="insights-chart-inner">
        {/* Y-axis labels */}
        <View className="insights-yaxis">
          {[...steps].reverse().map((step) => (
            <Text key={step} className="insights-yaxis-label">
              {step}
            </Text>
          ))}
        </View>

        {/* Chart area with grid lines and bars */}
        <View className="insights-plot-area">
          {/* Dashed grid lines */}
          {steps.slice(1).reverse().map((step) => (
            <View
              key={`grid-${step}`}
              className="insights-grid-line"
              style={{
                bottom: `${(step / computedMax) * 100}%` as any,
              }}
            />
          ))}

          {/* Bars */}
          <View className="insights-bars-row">
            {data.map((point, index) => {
              const heightPercent = computedMax > 0 ? (point.value / computedMax) * 100 : 0;
              const isSelected = selectedIndex === index;
              return (
                <Pressable
                  key={point.label}
                  className="insights-bar-col"
                  onPress={() => onBarPress?.(index)}
                >
                  {/* The bar itself */}
                  <View
                    className={
                      isSelected
                        ? 'insights-bar insights-bar-highlighted'
                        : 'insights-bar insights-bar-default'
                    }
                    style={{ height: `${heightPercent}%` as any }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View className="insights-xaxis">
        {/* spacer matching y-axis width */}
        <View className="insights-yaxis-spacer" />
        <View className="insights-xaxis-labels">
          {data.map((point) => (
            <Text key={point.label} className="insights-xaxis-label">
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default InsightsBarChart;
