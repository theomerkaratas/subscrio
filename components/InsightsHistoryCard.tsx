import React from 'react';
import { View, Text, Image } from 'react-native';

export type InsightsHistoryItem = {
  id: string;
  icon: any;
  name: string;
  date: string;   // e.g. "June 25, 12:00"
  price: number;
  currency?: string;
  billingPeriod?: string; // e.g. "per month"
};

type InsightsHistoryCardProps = InsightsHistoryItem;

const InsightsHistoryCard = ({
  icon,
  name,
  date,
  price,
  currency = 'USD',
  billingPeriod = 'per month',
}: InsightsHistoryCardProps) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <View className="insights-history-card">
      {/* Icon */}
      <View className="insights-history-icon-wrap">
        <Image source={icon} className="insights-history-icon" resizeMode="contain" />
      </View>

      {/* Name + date */}
      <View className="insights-history-copy">
        <Text className="insights-history-name" numberOfLines={1}>
          {name}
        </Text>
        <Text className="insights-history-date" numberOfLines={1}>
          {date}
        </Text>
      </View>

      {/* Price */}
      <View className="insights-history-price-box">
        <Text className="insights-history-price">{formattedPrice}</Text>
        <Text className="insights-history-billing">{billingPeriod}</Text>
      </View>
    </View>
  );
};

export default InsightsHistoryCard;
