import React from 'react';
import { View, Text } from 'react-native';

export type BarChartDataPoint = {
  label: string;
  value: number;
  highlighted?: boolean;
};

type InsightsBarChartProps = {
  data: BarChartDataPoint[];
  maxValue?: number;
  yAxisSteps?: number[];
};

const InsightsBarChart = ({ data, maxValue, yAxisSteps }: InsightsBarChartProps) => {
  const computedMax = maxValue ?? Math.ceil(Math.max(...data.map((d) => d.value)) / 5) * 5;
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
            {data.map((point) => {
              const heightPercent = computedMax > 0 ? (point.value / computedMax) * 100 : 0;
              return (
                <View key={point.label} className="insights-bar-col">
                  {/* Value bubble above highlighted bar */}
                  {point.highlighted && (
                    <View className="insights-bubble">
                      <Text className="insights-bubble-text">${point.value}</Text>
                    </View>
                  )}

                  {/* The bar itself */}
                  <View
                    className={
                      point.highlighted
                        ? 'insights-bar insights-bar-highlighted'
                        : 'insights-bar insights-bar-default'
                    }
                    style={{ height: `${heightPercent}%` as any }}
                  />
                </View>
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
