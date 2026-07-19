import { View, Text, Image } from 'react-native'
import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface UpcomingSubscriptionCardProps {
  name: string
  price: number
  daysLeft: number
  icon: any | string
  currency?: string
}

const UpcomingSubscriptionCard = ({ name, price, daysLeft, icon, currency }: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <View className="upcoming-icon-wrap">
          <Image 
            source={typeof icon === 'string' ? { uri: icon } : icon} 
            className="upcoming-icon" 
            style={typeof icon === 'string' ? { width: 24, height: 24, borderRadius: 4 } : undefined}
          />
        </View>
        <View>
          <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
          <Text className="upcoming-meta">{daysLeft > 1 ? `${daysLeft} days left` : 'Last day'}</Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard