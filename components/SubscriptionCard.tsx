import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import clsx from 'clsx'

const SubscriptionCard = ({ name, price, currency, icon, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate, status, onCancelPress, isCancelling, onEdit }: SubscriptionCardProps) => {
    const { isDark } = useTheme();
  return (
        <Pressable
            onPress={onPress}
            className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
            style={!expanded && color && !isDark ? { backgroundColor: color } : undefined }
        >
        <View className="sub-head">
            <View className="sub-main">
                <View className="sub-icon-wrap">
                    <Image 
                        source={typeof icon === 'string' ? { uri: icon } : (icon || require('@/assets/icons/logo.png'))} 
                        className="sub-icon" 
                        style={typeof icon === 'string' ? { width: 32, height: 32, borderRadius: 8 } : undefined}
                    />
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
                <Text className="sub-billing">{billing === 'One-time' ? 'One-time' : billing || 'N/A'}</Text>
            </View>
        </View>
        {expanded && (
                <View className="sub-body">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Type:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{billing || 'Not specified'}</Text>
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
                                <Text className="sub-label">{billing === "One-time" ? "Date:" : "Renewal Date:"}</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{renewalDate ? formatSubscriptionDateTime(renewalDate) : startDate ? formatSubscriptionDateTime(startDate) : 'No date set'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{status ? formatStatusLabel(status) : 'Unknown'}</Text>
                            </View>
                        </View>
                        <View className="mt-4 flex-row gap-3">
                            <TouchableOpacity
                                onPress={onEdit}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-full bg-accent py-4"
                            >
                                <Text className="font-sans-bold text-white">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onCancelPress}
                                activeOpacity={0.9}
                                disabled={isCancelling || status === 'cancelled'}
                                className={clsx('flex-1 items-center justify-center rounded-full bg-primary py-4', status === 'cancelled' && 'sub-cancel-disabled')}
                            >
                                <Text className="sub-cancel-text">
                                    {status === 'cancelled' ? 'Cancelled' : isCancelling ? 'Cancelling...' : billing === "One-time" ? 'Remove' : 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
    </Pressable>
  )
}

export default SubscriptionCard