import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType | string;
        name: string;
        domain?: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: "Monthly" | "Yearly" | "One-time";
        renewalDate?: string;
        color?: string;
        monthlyAdjustments?: { [monthYear: string]: number | "skip" };
        usage?: { [monthYear: string]: "low" | "medium" | "high" };
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded?: boolean;
        onPress?: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
        onEdit?: () => void;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType | string;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }
}

export {};