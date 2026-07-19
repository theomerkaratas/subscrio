import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText, G } from "react-native-svg";
import dayjs from "dayjs";
import { useTheme } from "@/context/ThemeContext";

type UsageTrendChartProps = {
  subscriptions: Subscription[];
};

type TrendPoint = {
  label: string; // e.g., "Jan" or "2025"
  monthKey?: string; // e.g. "2026-01"
  value: number; // 0 to 3
  details: {
    totalActive: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
};

const UsageTrendChart = ({ subscriptions }: UsageTrendChartProps) => {
  const [timeRange, setTimeRange] = useState<"monthly" | "yearly">("monthly");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { isDark } = useTheme();

  // ─── Data processing ───────────────────────────────────────────────
  
  const chartData: TrendPoint[] = useMemo(() => {
    if (subscriptions.length === 0) return [];

    const now = dayjs();
    
    if (timeRange === "monthly") {
      // Past 6 months
      const points: TrendPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const m = now.subtract(i, "month");
        const monthKey = m.format("YYYY-MM");
        const label = m.format("MMM");

        let sum = 0;
        let count = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        subscriptions.forEach(sub => {
          // Check if subscription was active during this month
          const start = sub.startDate ? dayjs(sub.startDate) : null;
          if (start && start.isAfter(m.endOf("month"))) return;
          if (sub.status === "cancelled" && sub.renewalDate && dayjs(sub.renewalDate).isBefore(m.startOf("month"))) {
             return;
          }

          // Read usage
          if (sub.usage && monthKey in sub.usage) {
            const usageVal = sub.usage[monthKey];
            count++;
            if (usageVal === "high") {
              sum += 3;
              highCount++;
            } else if (usageVal === "medium") {
              sum += 2;
              mediumCount++;
            } else if (usageVal === "low") {
              sum += 1;
              lowCount++;
            }
          }
        });

        const avg = count > 0 ? sum / count : 0;
        points.push({
          label,
          monthKey,
          value: parseFloat(avg.toFixed(2)),
          details: {
            totalActive: count,
            highCount,
            mediumCount,
            lowCount
          }
        });
      }
      return points;
    } else {
      // Yearly: last 3 years (e.g. 2024, 2025, 2026)
      const years = [now.subtract(2, "year").year(), now.subtract(1, "year").year(), now.year()];
      return years.map(year => {
        let sum = 0;
        let logCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        let activeSubs = new Set<string>();

        subscriptions.forEach(sub => {
          if (!sub.usage) return;
          
          Object.entries(sub.usage).forEach(([monthKey, val]) => {
            if (monthKey.startsWith(String(year))) {
              logCount++;
              activeSubs.add(sub.id);
              if (val === "high") {
                sum += 3;
                highCount++;
              } else if (val === "medium") {
                sum += 2;
                mediumCount++;
              } else if (val === "low") {
                sum += 1;
                lowCount++;
              }
            }
          });
        });

        const avg = logCount > 0 ? sum / logCount : 0;
        return {
          label: String(year),
          value: parseFloat(avg.toFixed(2)),
          details: {
            totalActive: activeSubs.size,
            highCount,
            mediumCount,
            lowCount
          }
        };
      });
    }
  }, [subscriptions, timeRange]);

  // ─── SVG Layout Coordinates ─────────────────────────────────────────
  const svgWidth = 320;
  const svgHeight = 160;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const pointsCount = chartData.length;

  const coords = useMemo(() => {
    if (pointsCount <= 1) return [];

    return chartData.map((d, index) => {
      const x = paddingLeft + (index * chartWidth) / (pointsCount - 1);
      // y value maps usage index (0 to 3.0) to SVG height. High is 3.0, Low/Min is 0
      const y = paddingTop + chartHeight - (d.value / 3.0) * chartHeight;
      return { x, y };
    });
  }, [chartData, pointsCount, chartWidth, chartHeight]);

  // SVG Line path
  const linePath = useMemo(() => {
    if (coords.length < 2) return "";
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Clean cubic bezier curves (midpoint control points)
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return path;
  }, [coords]);

  // SVG Area path for gradient fill
  const areaPath = useMemo(() => {
    if (coords.length < 2) return "";
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
  }, [coords, linePath, chartHeight]);

  const activePoint = selectedIndex !== null ? chartData[selectedIndex] : null;

  const getUsageText = (val: number) => {
    if (val === 0) return "No usage";
    if (val < 1.5) return "Low";
    if (val < 2.5) return "Medium";
    return "High";
  };

  return (
    <View className="rounded-3xl border border-border dark:border-[rgba(255,255,255,0.1)] bg-card dark:bg-[#1a1d27] p-5 mb-6">
      {/* Title & Range Selector */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-sans-bold text-primary dark:text-[#f0ede4]">
          Usage History & Trends
        </Text>
        <View className="flex-row bg-muted dark:bg-[#0f1117] rounded-xl p-1">
          <TouchableOpacity
            onPress={() => {
              setTimeRange("monthly");
              setSelectedIndex(null);
            }}
            className={`px-3 py-1.5 rounded-lg ${
              timeRange === "monthly" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-sans-bold ${
                timeRange === "monthly" ? "text-primary dark:text-[#0f1117]" : "text-muted-foreground"
              }`}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setTimeRange("yearly");
              setSelectedIndex(null);
            }}
            className={`px-3 py-1.5 rounded-lg ${
              timeRange === "yearly" ? "bg-accent" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-sans-bold ${
                timeRange === "yearly" ? "text-primary dark:text-[#0f1117]" : "text-muted-foreground"
              }`}
            >
              Yearly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chart Area */}
      {chartData.length < 2 ? (
        <View className="h-40 justify-center items-center">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Insufficient usage data to display trends.
          </Text>
        </View>
      ) : (
        <View className="items-center">
          <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <Defs>
              <LinearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#ea7a53" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#ea7a53" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Grid Lines */}
            {[0, 1, 2, 3].map(level => {
              const y = paddingTop + chartHeight - (level / 3.0) * chartHeight;
              return (
                <G key={level}>
                  {/* Grid Line */}
                  <Line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4,4"
                  />
                  {/* Y Axis Labels */}
                  <SvgText
                    fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    fontSize={10}
                    fontWeight="bold"
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                  >
                    {level === 0 ? "Empty" : level === 1 ? "Low" : level === 2 ? "Med" : "High"}
                  </SvgText>
                </G>
              );
            })}

            {/* Area under the line */}
            <Path d={areaPath} fill="url(#usageGradient)" />

            {/* Main Trend Line */}
            <Path d={linePath} stroke="#ea7a53" strokeWidth={3} fill="none" />

            {/* Data Point Circles */}
            {coords.map((pt, idx) => (
              <G key={idx}>
                {/* Visual Circle */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={selectedIndex === idx ? 6 : 4}
                  fill={selectedIndex === idx ? "#ea7a53" : isDark ? "#f0ede4" : "#081126"}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                {/* Tap target - larger invisible circle */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={15}
                  fill="transparent"
                  onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                />
              </G>
            ))}

            {/* X-axis labels */}
            {chartData.map((d, idx) => {
              const x = paddingLeft + (idx * chartWidth) / (pointsCount - 1);
              return (
                <SvgText
                  key={idx}
                  fill={selectedIndex === idx ? "#ea7a53" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                  fontSize={10}
                  fontWeight="bold"
                  x={x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                >
                  {d.label}
                </SvgText>
              );
            })}
          </Svg>

          {/* Interactive Breakdown Details Card */}
          <View className="w-full mt-4 bg-muted dark:bg-[#0f1117] rounded-2xl p-4 min-h-[96px] justify-center">
            {activePoint ? (
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-sans-bold text-primary dark:text-[#f0ede4]">
                    {activePoint.label} Breakdown
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-sans-medium text-muted-foreground">Index:</Text>
                    <View className="px-2 py-0.5 rounded-full bg-accent/20 dark:bg-accent/10">
                      <Text className="text-xs font-sans-bold text-accent">
                        {activePoint.value} ({getUsageText(activePoint.value)})
                      </Text>
                    </View>
                  </View>
                </View>

                {activePoint.details.totalActive === 0 ? (
                  <Text className="text-xs font-sans-medium text-muted-foreground">
                    No active usage tracked in this period.
                  </Text>
                ) : (
                  <View className="flex-row justify-between pt-1">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <Text className="text-xs font-sans-medium text-muted-foreground">
                        High: {activePoint.details.highCount}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                      <Text className="text-xs font-sans-medium text-muted-foreground">
                        Med: {activePoint.details.mediumCount}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                      <Text className="text-xs font-sans-medium text-muted-foreground">
                        Low: {activePoint.details.lowCount}
                      </Text>
                    </View>
                    <Text className="text-[11px] font-sans-bold text-muted-foreground">
                      Total: {activePoint.details.totalActive} subs
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-xs font-sans-semibold text-center text-muted-foreground dark:text-[rgba(255,255,255,0.45)]">
                💡 Tap on any point or label above to inspect details
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default UsageTrendChart;
