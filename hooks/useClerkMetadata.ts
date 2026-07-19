import { useUser } from "@clerk/expo";

export interface ClerkSubscription {
  status: string;
  endsAt?: string;
}

export interface ClerkUsageHistory {
  month: string;
  amount: number;
}

export interface ClerkUsage {
  currentMonthSpent: number;
  limit: number;
  history?: ClerkUsageHistory[];
}

export interface ClerkPublicMetadata {
  subscription?: ClerkSubscription;
  usage?: ClerkUsage;
}

const DEFAULT_METADATA: Required<ClerkPublicMetadata> = {
  subscription: {
    status: "active",
  },
  usage: {
    currentMonthSpent: 0,
    limit: 50.00,
    history: [],
  },
};

export function useClerkMetadata() {
  const { user, isLoaded } = useUser();

  const metadata = (user?.publicMetadata || {}) as ClerkPublicMetadata;

  const subscription: ClerkSubscription = {
    ...DEFAULT_METADATA.subscription,
    ...metadata.subscription,
  };

  const usage: ClerkUsage = {
    ...DEFAULT_METADATA.usage,
    ...metadata.usage,
  };

  const limit = usage.limit;
  const spent = usage.currentMonthSpent;
  const isOverLimit = spent >= limit;
  const spentPercentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

  return {
    isLoaded,
    subscription,
    usage,
    isOverLimit,
    spentPercentage,
    rawMetadata: metadata,
  };
}
