import "../../global.css"
import { Text, View, Image, Pressable, FlatList, Alert, TextInput, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { HOME_USER, HOME_BALANCE, UPCOMING_SUBSCRIPTIONS, DUMMY_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, convertAmount } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useState } from "react";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import AdjustBalanceModal from "@/components/AdjustBalanceModal";
import { useUser } from "@clerk/expo";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useTheme } from "@/context/ThemeContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { user } = useUser();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { subscriptions, addSubscription, balance, updateBalance, currency, isDemoMode, cancelSubscription, updateSubscription } = useSubscriptions();
    const { isDark } = useTheme();
    const [query, setQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [adjustModalVisible, setAdjustModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
    const [cancellingIds, setCancellingIds] = useState<string[]>([]);

    const handleAddSubscription = (subscription: Subscription) => {
        addSubscription(subscription);
    };

    const handleEdit = (subId: string) => {
        const sub = subscriptions.find(s => s.id === subId);
        if (sub) {
            setSubscriptionToEdit(sub);
            setEditModalVisible(true);
        }
    };

    const handleUpdateSubscription = (updatedSub: Subscription) => {
        updateSubscription(updatedSub.id, updatedSub);
        setEditModalVisible(false);
        setSubscriptionToEdit(null);
    };

    const handleCancel = (id: string, name?: string, isOneTime?: boolean) => {
        if (!id) return;
        Alert.alert(
            "Cancel subscription",
            `Are you sure you want to cancel ${name || 'this subscription'}?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, cancel",
                    style: "destructive",
                    onPress: async () => {
                        setCancellingIds((cur) => [...cur, id]);
                        try {
                            await cancelSubscription(id);
                        } finally {
                            setCancellingIds((cur) => cur.filter((x) => x !== id));
                        }
                    },
                },
            ]
        );
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return subscriptions;
        return subscriptions.filter(
            (sub) =>
                sub.name.toLowerCase().includes(q) ||
                sub.category?.toLowerCase().includes(q) ||
                sub.plan?.toLowerCase().includes(q) ||
                sub.status?.toLowerCase().includes(q)
        );
    }, [query, subscriptions]);

    const upcomingConverted = React.useMemo(() => {
        const now = dayjs();
        const monthKey = now.format('YYYY-MM');
        if (isDemoMode) {
            return subscriptions
                .filter(sub => sub.status === 'active' && (sub.renewalDate || (sub.billing === 'One-time' && sub.startDate)))
                .map(sub => {
                    let price = sub.price;
                    const subDate = dayjs(sub.renewalDate || sub.startDate);
                    if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
                        const adjustment = sub.monthlyAdjustments[monthKey];
                        if (adjustment === 'skip') return null;
                        if (typeof adjustment === 'number') price = adjustment;
                    }
                    return {
                        id: sub.id,
                        icon: sub.icon,
                        name: sub.name,
                        price: price,
                        currency: sub.currency,
                        daysLeft: dayjs(sub.renewalDate).diff(now, 'day')
                    } as UpcomingSubscription;
                })
                .filter((sub): sub is UpcomingSubscription => sub !== null && sub.daysLeft >= 0 && sub.daysLeft <= 15)
                .sort((a, b) => a.daysLeft - b.daysLeft);
        }
        return UPCOMING_SUBSCRIPTIONS.map(sub => ({
            ...sub,
            price: convertAmount(sub.price, "USD", currency), // Assuming base for static data is USD
            currency: currency
        }));
    }, [subscriptions, isDemoMode, currency]);

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117] p-5">

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header mb-2">
                            <View className="home-user">
                                <Image 
                                    source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                                    className="home-avatar" 
                                />
                                <Text className="home-user-name" numberOfLines={1} ellipsizeMode="tail">
                                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || HOME_USER.name}
                                </Text>
                            </View>

                            <Pressable
                                className={isDark ? "w-12 h-12 rounded-full bg-transparent p-2 justify-center items-center border border-white" : "w-12 h-12 rounded-full bg-background dark:bg-[#1a1d27] p-2 justify-center items-center border border-muted dark:border-[rgba(255,255,255,0.1)]"}
                                onPress={() => setModalVisible(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Add subscription"
                            >
                                <Image source={icons.add} className="w-6 h-6" style={isDark ? { tintColor: '#ffffff' } : undefined} />
                            </Pressable>
                        </View>

                        <View className="home-balance-card">
                            <View className="flex-row items-center justify-between">
                                <Text className="home-balance-label">Balance</Text>
                                <Pressable
                                    onPress={() => setAdjustModalVisible(true)}
                                    className="h-8 items-center justify-center rounded-full bg-white/20 px-3"
                                    accessibilityRole="button"
                                    accessibilityLabel="Adjust balance"
                                >
                                    <Text className="text-sm font-sans-bold text-white">Adjust</Text>
                                </Pressable>
                            </View>

                            <View className="home-balance-row">
                                <Text className="home-balance-amount">
                                    {formatCurrency(balance, currency)}
                                </Text>
                                <Text className="home-balance-date">
                                    {dayjs(isDemoMode ? DUMMY_SUBSCRIPTIONS[0].renewalDate : HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-5">
                            <ListHeading title="Upcoming" />
                            
                            <FlatList
                                data={upcomingConverted}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View className="flex-1 justify-center items-center h-20 w-[100vw]">
                                        <Text className="home-empty-state">No upcoming renewals yet.</Text>
                                    </View>
                                }
                            />
                        </View>

                        <ListHeading title="Subscriptions" />

                        {/* Search Bar */}
                        <View className="subs-search-wrap mb-4">
                            <Text className="text-base">🔍</Text>
                            <TextInput
                                className="subs-search-input"
                                placeholder="Search by name, category…"
                                placeholderTextColor={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)"}
                                value={query}
                                onChangeText={setQuery}
                                returnKeyType="search"
                                clearButtonMode="never"
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                            {query.length > 0 && (
                                <TouchableOpacity
                                    className="subs-search-clear"
                                    onPress={() => setQuery("")}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search"
                                >
                                    <Text className="subs-search-clear-text">✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard 
                        {...item} 
                        expanded={expandedSubscriptionId === item.id} 
                        onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)} 
                        onCancelPress={() => handleCancel(item.id, item.name, item.billing === "One-time")}
                        isCancelling={cancellingIds.includes(item.id)}
                        onEdit={() => handleEdit(item.id)}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
                contentContainerClassName="pb-30"
            />

            <CreateSubscriptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddSubscription}
            />

            <AdjustBalanceModal
                visible={adjustModalVisible}
                onClose={() => setAdjustModalVisible(false)}
                onSubmit={updateBalance}
            />

            <CreateSubscriptionModal
                visible={editModalVisible}
                onClose={() => {
                    setEditModalVisible(false);
                    setSubscriptionToEdit(null);
                }}
                onSubmit={handleUpdateSubscription}
                subscription={subscriptionToEdit || undefined}
            />
        </SafeAreaView>
    );
}