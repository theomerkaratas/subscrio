import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import dayjs from 'dayjs';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fixed pixel width per column — makes chart scrollable beyond screen edge */
const COL_WIDTH   = 52;
const CHART_HEIGHT = 160;
const NUM_MONTHS  = 12; // full year of scrollable history

const FALLBACK_COLORS = [
  '#f5c542', '#e8def8', '#b8d4e3', '#b8e8d0', '#ea7a53', '#8fd1bd',
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Contribution = { id: string; name: string; color: string; amount: number };
type MonthData    = { key: string; label: string; total: number; contributions: Contribution[] };

// ─── Data helpers ─────────────────────────────────────────────────────────────

function toMonthlyCost(sub: Subscription): number {
  return sub.billing === 'Yearly' ? sub.price / 12 : sub.price;
}

function buildMonthlyData(subscriptions: Subscription[]): MonthData[] {
  const now = dayjs();
  return Array.from({ length: NUM_MONTHS }, (_, i) => {
    const m        = now.subtract(NUM_MONTHS - 1 - i, 'month');
    const monthEnd = m.endOf('month');
    const contributions: Contribution[] = [];

    subscriptions.forEach((sub, si) => {
      const start = sub.startDate ? dayjs(sub.startDate) : null;
      if (start && start.isAfter(monthEnd)) return;
      const amount = toMonthlyCost(sub);
      if (amount <= 0) return;
      contributions.push({
        id: sub.id,
        name: sub.name,
        color: sub.color ?? FALLBACK_COLORS[si % FALLBACK_COLORS.length],
        amount,
      });
    });

    contributions.sort((a, b) => b.amount - a.amount); // largest slice at bottom
    const total = contributions.reduce((s, c) => s + c.amount, 0);
    return { key: m.format('YYYY-MM'), label: m.format('MMM'), total, contributions };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ColumnProps = {
  month: MonthData;
  colH: number;
  isActive: boolean;
  isDimmed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
};

/**
 * A single month column — a Pressable wrapping stacked color segments.
 * Pressable lives inside the horizontal ScrollView, so React Native's
 * gesture system naturally distinguishes a horizontal swipe (→ scroll)
 * from a stationary press (→ onPressIn fires, breakdown panel appears).
 *
 * NOTE: Not memoized — onPressIn/onPressOut are inline arrow functions
 * in the parent's map(), so React.memo's shallow comparison would always
 * fail anyway. With only 12 columns the re-render cost is negligible.
 */
const AreaColumn = ({ month, colH, isActive, isDimmed, onPressIn, onPressOut }: ColumnProps) => (
  <Pressable
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    style={{
      width: COL_WIDTH,
      height: CHART_HEIGHT,
      justifyContent: 'flex-end',
      opacity: isDimmed ? 0.3 : 1,
    }}
  >
    {/* Active-column indicator — thin bar at the top edge of the stack */}
    {isActive && colH > 0 && (
      <View
        className="insights-area-col-active-bar"
        style={{ bottom: colH }}
      />
    )}

    {/* Stacked segments — column-reverse so first child sits at the bottom */}
    <View style={{ width: COL_WIDTH, height: colH, flexDirection: 'column-reverse' }}>
      {month.contributions.map(c => (
        <View
          key={c.id}
          style={{
            width: '100%',
            height: month.total > 0 ? (c.amount / month.total) * colH : 0,
            backgroundColor: c.color,
          }}
        />
      ))}
    </View>
  </Pressable>
);

// ─── Main component ───────────────────────────────────────────────────────────

type SpendingAreaChartProps = { subscriptions: Subscription[] };

const SpendingAreaChart = ({ subscriptions }: SpendingAreaChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // ── Derived data ────────────────────────────────────────────────────────────

  const data     = useMemo(() => buildMonthlyData(subscriptions), [subscriptions]);
  const maxTotal = useMemo(() => Math.max(...data.map(d => d.total), 1), [data]);

  /** Deduplicated legend entries, preserving first-seen order */
  const legendItems = useMemo(() => {
    const seen  = new Set<string>();
    const items: { id: string; name: string; color: string }[] = [];
    data.forEach(m =>
      m.contributions.forEach(c => {
        if (!seen.has(c.id)) { seen.add(c.id); items.push({ id: c.id, name: c.name, color: c.color }); }
      }),
    );
    return items;
  }, [data]);

  const activeData = activeIndex !== null ? data[activeIndex] : null;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <View className="insights-area-chart-card">

      {/* Y-axis max label */}
      <Text className="insights-area-yaxis-label">${maxTotal.toFixed(0)}</Text>

      {/*
        ── Horizontal ScrollView ──────────────────────────────────────────────
        Wider than the screen → the user swipes to navigate months.
        Each column is a Pressable, so React Native separates:
          • horizontal swipe  → ScrollView handles it (no gesture conflict)
          • stationary press  → Pressable.onPressIn fires → breakdown shows
          • finger lift       → Pressable.onPressOut fires → breakdown hides
      */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        // Prevent the outer vertical ScrollView from stealing touches
        // when the user is scrolling horizontally inside this chart.
        nestedScrollEnabled
      >
        <View style={{ width: COL_WIDTH * NUM_MONTHS }}>

          {/* ── Chart columns ─────────────────────────────────────────────── */}
          <View style={{ height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end' }}>
            {data.map((month, i) => {
              const colH     = maxTotal > 0 ? (month.total / maxTotal) * CHART_HEIGHT : 0;
              const isActive = activeIndex === i;
              const isDimmed = activeIndex !== null && !isActive;
              return (
                <AreaColumn
                  key={month.key}
                  month={month}
                  colH={colH}
                  isActive={isActive}
                  isDimmed={isDimmed}
                  onPressIn={() => setActiveIndex(i)}
                  onPressOut={() => setActiveIndex(null)}
                />
              );
            })}
          </View>

          {/* ── X-axis month labels (scroll with chart) ───────────────────── */}
          <View style={{ flexDirection: 'row', paddingTop: 6 }}>
            {data.map((month, i) => (
              <Text
                key={month.key}
                className={
                  activeIndex === i
                    ? 'insights-area-xaxis-label insights-area-xaxis-label-active'
                    : 'insights-area-xaxis-label'
                }
                style={{ width: COL_WIDTH }}
              >
                {month.label}
              </Text>
            ))}
          </View>

        </View>
      </ScrollView>

      {/*
        ── Breakdown panel ────────────────────────────────────────────────────
        Rendered OUTSIDE the ScrollView so it is never clipped or
        affected by scroll position. Appears on press, disappears on release.
      */}
      {activeData ? (
        <View className="insights-area-breakdown">
          <View className="insights-area-breakdown-header">
            <Text className="insights-area-breakdown-month">{activeData.label}</Text>
            <Text className="insights-area-breakdown-total">
              ${activeData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          {activeData.contributions.map(c => (
            <View key={c.id} className="insights-area-breakdown-row">
              <View className="insights-area-breakdown-dot" style={{ backgroundColor: c.color }} />
              <Text className="insights-area-breakdown-name" numberOfLines={1}>{c.name}</Text>
              <Text className="insights-area-breakdown-amount">
                ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        /* Reserve space so the card doesn't jump in height when a month is tapped */
        <View className="insights-area-breakdown-placeholder">
          <Text className="insights-area-breakdown-hint">Hold a month to see the breakdown</Text>
        </View>
      )}

      {/* ── Bottom legend ─────────────────────────────────────────────────── */}
      <View className="insights-area-legend">
        {legendItems.map(item => (
          <View key={item.id} className="insights-area-legend-item">
            <View className="insights-area-legend-dot" style={{ backgroundColor: item.color }} />
            <Text className="insights-area-legend-label" numberOfLines={1}>{item.name}</Text>
          </View>
        ))}
      </View>

    </View>
  );
};

export default SpendingAreaChart;
