<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for **Subscrio** — a React Native Expo subscription tracker app. PostHog SDK (`posthog-react-native` v4.57.0) was installed alongside its Expo peer dependencies (`expo-file-system`, `expo-application`, `expo-device`, `expo-localization`). A PostHog singleton client (`src/config/posthog.ts`) was created reading config from `app.config.js` extras via `expo-constants`. `PostHogProvider` was added to `app/_layout.tsx` with manual screen tracking (Expo Router compatibility) and automatic user identification via Clerk user IDs on sign-in. Ten events were instrumented across six files covering the full subscription lifecycle, authentication, and user preferences.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fires when a new user completes email verification and creates an account. | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | Fires when an existing user successfully signs in with email and password. | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | Fires when the user confirms sign out. | `app/(tabs)/settings.tsx` |
| `subscription_created` | Fires when the user submits the form to add a new subscription. | `components/CreateSubscriptionModal.tsx` |
| `subscription_updated` | Fires when the user saves edits to an existing subscription. | `components/CreateSubscriptionModal.tsx` |
| `subscription_cancelled` | Fires when the user confirms cancellation of a subscription. | `app/(tabs)/index.tsx` |
| `balance_adjusted` | Fires when the user submits an adjustment to their balance. | `components/AdjustBalanceModal.tsx` |
| `usage_logged` | Fires when the user sets or changes a utilization level for a subscription in a given month. | `app/(tabs)/usage.tsx` |
| `currency_changed` | Fires when the user selects a different display currency in settings. | `app/(tabs)/settings.tsx` |
| `theme_toggled` | Fires when the user toggles dark mode on or off. | `app/(tabs)/settings.tsx` |
| `profile_updated` | Fires when the user saves their profile name changes. | `app/(tabs)/settings.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/519680/dashboard/1872673)
- [Sign-ups and Sign-ins](https://us.posthog.com/project/519680/insights/2ZVDFhbS)
- [Sign-up to First Subscription funnel](https://us.posthog.com/project/519680/insights/5zeJe85V)
- [Subscriptions created by category](https://us.posthog.com/project/519680/insights/q2ZESX5P)
- [Subscription created vs cancelled](https://us.posthog.com/project/519680/insights/bvMLyDLZ)
- [Usage logging by level](https://us.posthog.com/project/519680/insights/VGm2bxqn)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — the `InitialLayout` identifies users on `isSignedIn && user` changes, which covers both fresh logins and returning sessions that restore from Clerk's token cache.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
