import "../../global.css"
import { Text, View, Image, Pressable, FlatList } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { HOME_USER, HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, convertAmount } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import AdjustBalanceModal from "@/components/AdjustBalanceModal";
import { useState } from "react";
import { useUser } from "@clerk/expo";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useTheme } from "@/context/ThemeContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { user } = useUser();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { subscriptions, addSubscription, balance, updateBalance, currency } = useSubscriptions();
    const { isDark } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [adjustModalVisible, setAdjustModalVisible] = useState(false);

    const handleAddSubscription = (subscription: Subscription) => {
        addSubscription(subscription);
    };

    const upcomingConverted = UPCOMING_SUBSCRIPTIONS.map(sub => ({
        ...sub,
        price: convertAmount(sub.price, "USD", currency), // Assuming base for static data is USD
        currency: currency
    }));

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-[#0f1117] p-5">

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
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
                                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-5">
                            <ListHeading title="Upcoming" />
                            
                            <FlatList
                                data={upcomingConverted}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} currency={currency} />}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                            />
                        </View>

                        <ListHeading title="Subscriptions" />
                    </>
                )}
                data={subscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard 
                        {...item} 
                        expanded={expandedSubscriptionId === item.id} 
                        onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)} 
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
        </SafeAreaView>
    );
}