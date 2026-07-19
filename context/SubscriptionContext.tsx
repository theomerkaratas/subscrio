import React, { createContext, useContext, useState, ReactNode } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  cancelSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((prev) => [subscription, ...prev]);
  };

  const cancelSubscription = async (id: string) => {
    // In a real app this would call an API. Here we just mark the
    // subscription as cancelled so the UI can reflect the change.
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s)));
    return Promise.resolve();
  };

  const updateSubscription = (id: string, patch: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, cancelSubscription, updateSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscriptions must be used within a SubscriptionProvider");
  }
  return context;
}
