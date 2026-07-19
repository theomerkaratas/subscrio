import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/SubscriptionContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Frequency = "Monthly" | "Yearly";
type PaymentType = "Subscription" | "One-time";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#fde68a",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c7f2a4",
  Cloud: "#bae6fd",
  Music: "#fbc4ab",
  Other: "#e5e7eb",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = (name: string) =>
  `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

const calcRenewalDate = (frequency: Frequency): string =>
  frequency === "Monthly"
    ? dayjs().add(1, "month").toISOString()
    : dayjs().add(1, "year").toISOString();

// ─── Component ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  price: "",
  frequency: "Monthly" as Frequency,
  category: "",
  paymentType: "Subscription" as PaymentType,
};

const CreateSubscriptionModal = ({ visible, onClose, onSubmit }: Props) => {
  const { currency } = useSubscriptions();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    const trimmedPrice = form.price.trim().replace(",", ".");
    const isNumeric = /^[0-9]+(\.[0-9]+)?$/.test(trimmedPrice);
    const parsed = Number(trimmedPrice);
    if (!trimmedPrice || !isNumeric || isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0)
      next.price = "Enter a valid positive price.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;
    const now = dayjs().toISOString();
    const parsedPrice = Number(form.price.trim().replace(",", "."));
    const isOneTime = form.paymentType === "One-time";
    const subscription: Subscription = {
      id: generateId(form.name),
      name: form.name.trim(),
      price: parseFloat(parsedPrice.toFixed(2)),
      currency,
      billing: isOneTime ? "One-time" : form.frequency,
      category: form.category || "Other",
      status: "active",
      startDate: now,
      renewalDate: isOneTime ? undefined : calcRenewalDate(form.frequency),
      icon: icons.wallet,
      color: CATEGORY_COLORS[form.category] ?? CATEGORY_COLORS["Other"],
    };
    onSubmit(subscription);
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  // ── Close ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const isSubmitDisabled = !form.name.trim() || !form.price.trim();

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      {/* Dimmed overlay */}
      <Pressable className="modal-overlay" onPress={handleClose} accessible={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="modal-container"
      >
        {/* Header */}
        <View className="modal-header">
          <Text className="modal-title">New Payment</Text>
          <TouchableOpacity 
            className="modal-close" 
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          >
            <Text className="modal-close-text">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="modal-body"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* ── Payment Type ─────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Payment Type</Text>
            <View className="picker-row">
              {(["Subscription", "One-time"] as PaymentType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={clsx(
                    "picker-option",
                    form.paymentType === type && "picker-option-active"
                  )}
                  onPress={() => setForm((f) => ({ ...f, paymentType: type }))}
                >
                  <Text
                    className={clsx(
                      "picker-option-text",
                      form.paymentType === type && "picker-option-text-active"
                    )}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* ── Name ──────────────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Name</Text>
            <TextInput
              className={clsx("auth-input", errors.name && "auth-input-error")}
              placeholder="e.g. Spotify"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={form.name}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, name: v }));
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.name ? (
              <Text className="auth-error">{errors.name}</Text>
            ) : null}
          </View>

          {/* ── Price ─────────────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Price (USD)</Text>
            <TextInput
              className={clsx("auth-input", errors.price && "auth-input-error")}
              placeholder="e.g. 9.99"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={form.price}
              onChangeText={(v) => {
                setForm((f) => ({ ...f, price: v }));
                if (errors.price)
                  setErrors((e) => ({ ...e, price: undefined }));
              }}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            {errors.price ? (
              <Text className="auth-error">{errors.price}</Text>
            ) : null}
          </View>

          {/* ── Frequency ─────────────────────────────────────────────── */}
          {form.paymentType === "Subscription" && (
            <View className="auth-field">
              <Text className="auth-label">Billing Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as Frequency[]).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    className={clsx(
                      "picker-option",
                      form.frequency === freq && "picker-option-active"
                    )}
                    onPress={() => setForm((f) => ({ ...f, frequency: freq }))}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        form.frequency === freq && "picker-option-text-active"
                      )}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Category ──────────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Category</Text>
            <View className="category-scroll">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={clsx(
                    "category-chip",
                    form.category === cat && "category-chip-active"
                  )}
                  onPress={() =>
                    setForm((f) => ({
                      ...f,
                      category: f.category === cat ? "" : cat,
                    }))
                  }
                >
                  <Text
                    className={clsx(
                      "category-chip-text",
                      form.category === cat && "category-chip-text-active"
                    )}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <TouchableOpacity
            className={clsx(
              "auth-button",
              isSubmitDisabled && "auth-button-disabled"
            )}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Text className="auth-button-text">Add {form.paymentType}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
