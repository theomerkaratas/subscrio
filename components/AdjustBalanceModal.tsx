import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { clsx } from "clsx";
import { useSubscriptions } from "@/context/SubscriptionContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const AdjustBalanceModal = ({ visible, onClose, onSubmit }: Props) => {
  const { currency } = useSubscriptions();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const trimmedAmount = amount.trim().replace(",", ".");
    const isNumeric = /^[0-9]+(\.[0-9]+)?$/.test(trimmedAmount);
    const parsed = Number(trimmedAmount);
    if (!trimmedAmount || !isNumeric || isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid positive amount.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const parsedAmount = Number(amount.trim().replace(",", "."));
    const finalAmount = type === "increase" ? parsedAmount : -parsedAmount;
    onSubmit(parseFloat(finalAmount.toFixed(2)));
    setAmount("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full"
        >
          <View className="rounded-t-3xl bg-background dark:bg-[#1a1d27] p-6 pb-10">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-sans-bold text-primary dark:text-white">
                Adjust Balance
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-lg font-sans-medium text-muted-foreground">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setType("increase")}
                className={clsx(
                  "flex-1 h-12 items-center justify-center rounded-xl border",
                  type === "increase"
                    ? "bg-accent border-accent"
                    : "bg-transparent border-border dark:border-white/10"
                )}
              >
                <Text
                  className={clsx(
                    "text-base font-sans-bold",
                    type === "increase" ? "text-white" : "text-primary dark:text-white"
                  )}
                >
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setType("decrease")}
                className={clsx(
                  "flex-1 h-12 items-center justify-center rounded-xl border",
                  type === "decrease"
                    ? "bg-accent border-accent"
                    : "bg-transparent border-border dark:border-white/10"
                )}
              >
                <Text
                  className={clsx(
                    "text-base font-sans-bold",
                    type === "decrease" ? "text-white" : "text-primary dark:text-white"
                  )}
                >
                  Subtract
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-sans-medium text-muted-foreground">
                Amount ({currency})
              </Text>
              <TextInput
                value={amount}
                onChangeText={(text) => {
                    setAmount(text);
                    if (error) setError(null);
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
                className={clsx(
                  "h-14 rounded-2xl border bg-muted/30 px-4 text-lg font-sans-medium text-primary dark:text-white",
                  error ? "border-destructive" : "border-border dark:border-white/10"
                )}
                autoFocus
              />
              {error && (
                <Text className="mt-1 text-xs font-sans text-destructive">{error}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="h-14 items-center justify-center rounded-2xl bg-accent"
            >
              <Text className="text-lg font-sans-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AdjustBalanceModal;
