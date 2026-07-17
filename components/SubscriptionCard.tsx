import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import clsx from 'clsx'

const SubscriptionCard = ({ name, price, currency, icon, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate, status }: SubscriptionCardProps) => {
  return (
    <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style={!expanded && color ? { backgroundColor: color } : undefined }>
        <View className="sub-head">
            <View className="sub-main">
                <View className="sub-icon-wrap">
                    <Image source={icon || require('@/assets/default-icon.png')} className="sub-icon" />
                </View>
                <View className="sub-copy">
                    <Text numberOfLines={1} className="sub-title">{name || 'Unknown'}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" className="sub-metadata">
                        {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
                    </Text>
                </View>
            </View>
            <View className="sub-price-box">
                <Text className="sub-price">{formatCurrency(price || 0, currency || 'USD')}</Text>
                <Text className="sub-billing">{billing || 'N/A'}</Text>
            </View>
        </View>
        {expanded && (
                <View className="sub-body">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Payment:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{paymentMethod?.trim() || 'Not provided'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Category:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{category?.trim() || plan?.trim() || 'Not specified'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Started:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{startDate ? formatSubscriptionDateTime(startDate) : 'No start date'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Renewal Date:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{renewalDate ? formatSubscriptionDateTime(renewalDate) : 'No date set'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{status ? formatStatusLabel(status) : 'Unknown'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
    </Pressable>
  )
}

export default SubscriptionCard