import { icons } from "./icons";

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
    { name: "insights", title: "Insights", icon: icons.activity },
    { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
    name: "User",
};

export const HOME_BALANCE = {
    amount: 0,
    nextRenewalDate: new Date().toISOString(),
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [];

export const HOME_SUBSCRIPTIONS: Subscription[] = [];

export const DUMMY_SUBSCRIPTIONS: Subscription[] = [
    {
        id: "adobe-creative-cloud",
        icon: "https://www.google.com/s2/favicons?domain=adobe.com&sz=128",
        name: "Adobe Creative Cloud",
        plan: "Teams Plan",
        category: "Design",
        paymentMethod: "Visa ending in 8530",
        status: "active",
        startDate: "2025-03-20T10:00:00.000Z",
        price: 77.49,
        currency: "USD",
        billing: "Monthly",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
        color: "#f5c542",
        monthlyAdjustments: {
            "2026-01": "skip",
            "2026-02": "skip",
            "2026-03": "skip",
            "2026-04": "skip",
            "2026-05": "skip",
            "2026-06": "skip",
            "2026-07": "skip",
            "2026-09": "skip",
            "2026-10": "skip",
            "2026-11": "skip",
            "2026-12": "skip",
        }
    },
    {
        id: "google-cloud",
        name: "Google Cloud",
        icon: "https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128",
        price: 50,
        currency: "USD",
        billing: "One-time",
        category: "Cloud Services",
        status: "active",
        renewalDate: "2026-11-15T10:00:00.000Z",
        startDate: "2026-11-15T10:00:00.000Z",
        color: "#4285F4",
    },
    {
        id: "netflix",
        name: "Netflix",
        icon: "https://www.google.com/s2/favicons?domain=netflix.com&sz=128",
        price: 15.49,
        currency: "USD",
        billing: "Monthly",
        category: "Entertainment",
        status: "active",
        startDate: "2024-05-12T10:00:00.000Z",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(),
        color: "#E50914",
    },
    {
        id: "github-pro",
        icon: "https://www.google.com/s2/favicons?domain=github.com&sz=128",
        name: "GitHub Pro",
        plan: "Developer",
        category: "Developer Tools",
        paymentMethod: "Mastercard ending in 2408",
        status: "active",
        startDate: "2024-11-24T10:00:00.000Z",
        price: 9.99,
        currency: "USD",
        billing: "Monthly",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth(), 24).toISOString(),
        color: "#e8def8",
    },
    {
        id: "claude-pro",
        icon: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=128",
        name: "Claude Pro",
        plan: "Pro Plan",
        category: "AI Tools",
        paymentMethod: "Amex ending in 1010",
        status: "active",
        startDate: "2025-06-27T10:00:00.000Z",
        price: 20.0,
        currency: "USD",
        billing: "Monthly",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth(), 27).toISOString(),
        color: "#b8d4e3",
    },
    {
        id: "spotify-family",
        icon: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128",
        name: "Spotify Family",
        plan: "Family Plan",
        category: "Entertainment",
        paymentMethod: "PayPal",
        status: "active",
        startDate: "2024-01-15T10:00:00.000Z",
        price: 16.99,
        currency: "USD",
        billing: "Monthly",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
        color: "#1DB954",
        monthlyAdjustments: {
            "2026-06": 18.99,
            "2026-07": 18.99,
        }
    },
    {
        id: "figma-professional",
        icon: "https://www.google.com/s2/favicons?domain=figma.com&sz=128",
        name: "Figma Professional",
        plan: "Editor",
        category: "Design",
        paymentMethod: "Mastercard ending in 2408",
        status: "active",
        startDate: "2025-02-01T10:00:00.000Z",
        price: 15.0,
        currency: "USD",
        billing: "Monthly",
        renewalDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        color: "#F24E1E",
    }
];