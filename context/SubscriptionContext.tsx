import React, { createContext, useContext, useState, ReactNode } from "react";
import { HOME_SUBSCRIPTIONS, HOME_BALANCE, DUMMY_SUBSCRIPTIONS } from "@/constants/data";
import { convertAmount } from "@/lib/utils";
import dayjs from "dayjs";

interface SubscriptionContextType {
  subscriptions: Subscription[];
  balance: number;
  currency: string;
  isDemoMode: boolean;
  addSubscription: (subscription: Subscription) => void;
  cancelSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  updateBalance: (amount: number) => void;
  updateCurrency: (currency: string) => void;
  setDemoMode: (enabled: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [balance, setBalance] = useState<number>(HOME_BALANCE.amount);
  const [currency, setCurrency] = useState<string>("USD");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

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

  const updateBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  const updateCurrency = (newCurrency: string) => {
    if (newCurrency === currency) return;

    setBalance((prev) => convertAmount(prev, currency, newCurrency));
    setSubscriptions((prev) =>
      prev.map((s) => ({
        ...s,
        price: convertAmount(s.price, currency, newCurrency),
        currency: newCurrency,
      }))
    );
    setCurrency(newCurrency);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      setSubscriptions(DUMMY_SUBSCRIPTIONS);
      const now = dayjs();
      const monthKey = now.format('YYYY-MM');
      const totalAmount = DUMMY_SUBSCRIPTIONS.reduce((acc, sub) => {
        let price = sub.price;
        if (sub.billing === "One-time") {
           // For demo purposes, we show it if it's in the current month or future, 
           // but the user specifically asked for Google Cloud in November.
           // However, the balance usually shows what's due this month.
           // Let's stick to the current logic for recurring and add one-time if they are in this month.
           const now = dayjs();
           const subDate = dayjs(sub.renewalDate || sub.startDate);
           if (!subDate.isSame(now, 'month')) return acc;
        }
        if (sub.monthlyAdjustments && monthKey in sub.monthlyAdjustments) {
          const adjustment = sub.monthlyAdjustments[monthKey];
          if (adjustment === 'skip') return acc;
          if (typeof adjustment === 'number') price = adjustment;
        }
        return acc + price;
      }, 0);
      setBalance(totalAmount);
    } else {
      setSubscriptions([]);
      setBalance(0);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ 
      subscriptions, 
      balance, 
      currency, 
      isDemoMode,
      addSubscription, 
      cancelSubscription, 
      updateSubscription, 
      updateBalance, 
      updateCurrency,
      setDemoMode 
    }}>
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
