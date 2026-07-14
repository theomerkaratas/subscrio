import "../../global.css"
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-slate-900 p-6">
            <Text className="text-2xl font-bold text-white mb-6">
                Welcome to Nativewind!
            </Text>
            <Link href="/onboarding" className="mt-2 px-6 py-3 bg-white rounded-full text-slate-900 text-lg font-semibold shadow-lg">
                Go to Onboarding
            </Link>

            <Link href="/(auth)/sign-up" className="mt-4 px-6 py-3 bg-white rounded-full text-slate-900 text-lg font-semibold shadow-lg">
                Go to Sign Up
            </Link>

            <Link href="/(auth)/sign-in" className="mt-4 px-6 py-3 bg-white rounded-full text-slate-900 text-lg font-semibold shadow-lg">
                Go to Sign In
            </Link>

            <Link href="/subscriptions/spotify" className="mt-6 px-6 py-3 bg-white rounded-full text-slate-900 text-lg font-semibold shadow-lg">
                Spotify Subscription
            </Link>
            <Link
                href={{
                    pathname: "/subscriptions/[id]",
                    params: { id: "claude" },
                }}
                className="mt-4 px-6 py-3 bg-white rounded-full text-slate-900 text-lg font-semibold shadow-lg"
            >
                Claude Max Subscription
            </Link>
        </View>
    );
}