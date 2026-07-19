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
import { useTheme } from "@/context/ThemeContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Frequency = "Monthly" | "Yearly" | "One-time";
export type EditField = "payment" | "category" | "status";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
  subscription?: Subscription; // Added for editing
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
  domain: "",
  price: "",
  frequency: "Monthly" as Frequency,
  category: "",
  status: "active",
};

const CreateSubscriptionModal = ({ visible, onClose, onSubmit, subscription }: Props) => {
  const { currency } = useSubscriptions();
  const { isDark } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);

  const placeholderColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  // Initialize form when subscription changes or modal becomes visible
  React.useEffect(() => {
    if (visible) {
      if (subscription) {
        setForm({
          name: subscription.name,
          domain: subscription.domain || "",
          price: subscription.price.toString(),
          frequency: subscription.billing as Frequency,
          category: subscription.category || "",
          status: subscription.status || "active",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [visible, subscription]);

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
    const isOneTime = form.frequency === "One-time";
    
    let icon: string | any = icons.wallet;
    if (form.domain.trim()) {
      icon = `https://www.google.com/s2/favicons?domain=${form.domain.trim().toLowerCase()}&sz=128`;
    }

    const subData: Subscription = {
      id: subscription ? subscription.id : generateId(form.name),
      name: form.name.trim(),
      domain: form.domain.trim().toLowerCase(),
      price: parseFloat(parsedPrice.toFixed(2)),
      currency,
      billing: form.frequency,
      category: form.category || "Other",
      status: form.status as Subscription["status"],
      startDate: subscription ? subscription.startDate : now,
      renewalDate: isOneTime ? undefined : calcRenewalDate(form.frequency as "Monthly" | "Yearly"),
      icon,
      color: CATEGORY_COLORS[form.category] ?? CATEGORY_COLORS["Other"],
    };
    onSubmit(subData);
    onClose();
  };

  // ── Close ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const isSubmitDisabled = !form.name.trim() || !form.price.trim();

  const getTitle = () => {
    if (!subscription) return "New Payment";
    return "Edit Subscription";
  };

  const showAll = true;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View className="modal-overlay-centered">
        {/* Dimmed backdrop */}
        <Pressable className="modal-backdrop" onPress={handleClose} accessible={false} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="modal-container-centered"
        >
        {/* Header */}
        <View className="modal-header">
          <Text className="modal-title">{getTitle()}</Text>
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
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* ── Name ──────────────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Name</Text>
            <TextInput
              className={clsx("auth-input", errors.name && "auth-input-error")}
              placeholder="e.g. Spotify"
              placeholderTextColor={placeholderColor}
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

          {/* ── Domain (for dynamic logo) ──────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Domain (Optional, for logo)</Text>
            <TextInput
              className="auth-input"
              placeholder="e.g. spotify.com"
              placeholderTextColor={placeholderColor}
              value={form.domain}
              onChangeText={(v) => setForm((f) => ({ ...f, domain: v }))}
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="next"
            />
          </View>

          {/* ── Price ─────────────────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Price (USD)</Text>
            <TextInput
              className={clsx("auth-input", errors.price && "auth-input-error")}
              placeholder="e.g. 9.99"
              placeholderTextColor={placeholderColor}
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

          {/* ── Billing Frequency ─────────────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Billing Frequency</Text>
            <View className="picker-row">
              {(["One-time", "Monthly", "Yearly"] as Frequency[]).map((freq) => (
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

          {/* ── Status (Added for editing) ────────────────────────────── */}
          <View className="auth-field">
            <Text className="auth-label">Status</Text>
            <View className="picker-row">
              {(["active", "paused", "cancelled"] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  className={clsx(
                    "picker-option",
                    form.status === status && "picker-option-active"
                  )}
                  onPress={() => setForm((f) => ({ ...f, status }))}
                >
                  <Text
                    className={clsx(
                      "picker-option-text",
                      form.status === status && "picker-option-text-active"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
            <Text className="auth-button-text">{subscription ? "Save Changes" : "Add Payment"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
