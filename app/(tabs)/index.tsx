import "../../global.css"
import { Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { HOME_USER, HOME_BALANCE, UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);


export default function App() {
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const posthog = usePostHog();

    const handleSubscriptionPress = (id: string, name: string) => {
        const isExpanding = expandedSubscriptionId !== id;
        setExpandedSubscriptionId((currentId) => currentId === id ? null : id);
        if (isExpanding) {
            posthog.capture('subscription_card_expanded', { subscription_id: id, subscription_name: name });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
                            <View className="home-user">
                                <Image source={images.avatar} className="home-avatar" />
                                <Text className="home-user-name">{HOME_USER.name}</Text>
                            </View>

                            <TouchableOpacity
                                className="w-12 h-12 rounded-full bg-background p-2 justify-center items-center border border-muted"
                                onPress={() => posthog.capture('add_subscription_tapped')}
                            >
                                <Image source={icons.add} className="w-6 h-6" />
                            </TouchableOpacity>
                        </View>

                        <View className="home-balance-card">
                            <Text className="home-balance-label">Balance</Text>

                            <View className="home-balance-row">
                                <Text className="home-balance-amount">
                                    {formatCurrency(HOME_BALANCE.amount)}
                                </Text>
                                <Text className="home-balance-date">
                                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-5">
                            <ListHeading title="Upcoming" />
                            
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                            />
                        </View>

                        <ListHeading title="All Subscriptions" />
                    </>
                )}
                data={HOME_SUBSCRIPTIONS} 
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => handleSubscriptionPress(item.id, item.name)}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
                contentContainerClassName="pb-30"
            />
        </SafeAreaView>
    );
}