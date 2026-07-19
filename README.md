# 📱 Subscrio

Subscrio is a premium, feature-rich mobile subscription management application designed to help users take control of their recurring expenses, analyze spending habits, and monitor subscription usage. Built with modern mobile technologies, Subscrio provides a seamless experience for tracking costs, visualizing budget allocations, and keeping tabs on renewals in real-time.

---

## ✨ Features

- **📊 Comprehensive Spending Analytics**
  - **Dynamic Dashboard**: View active subscriptions, track total monthly spending, and check upcoming renewals.
  - **Insights & Visual Charts**: Analyze monthly spending trends with interactive area charts (`SpendingAreaChart`) and visualize expenses by category via robust bar charts (`InsightsBarChart`).

- **🔄 Subscription Management**
  - **Add/Modify Subscriptions**: Track custom subscriptions with options for plans, payment methods, renewal frequencies (Monthly, Yearly, One-time), and categories.
  - **Manage Adjustments**: Skip payments or record dynamic monthly pricing adjustments directly from the UI.
  - **Cancel Flow**: Easily log cancellation events to keep your active list up to date.

- **📈 Usage Tracking & Statistics**
  - Log monthly utilization levels (**Low**, **Medium**, or **High**) for individual subscriptions.
  - Visualize current-month usage distributions using the custom `UsageDistributionChart`.
  - Track historical utilization trends over time using the `UsageTrendChart` with adjustable monthly/yearly filters.

- **🔒 Clerk Authentication**
  - Seamless authentication flow including secure Sign In and Sign Up screens.
  - User identity cache (`tokenCache`) integration via Expo Secure Store for persistency.
  - Profile Management: In-app name updates and custom profile photo uploads using `expo-image-picker`.

- **🎨 Premium UI & Theming**
  - **Dark Mode Support**: Complete system-level light and dark theme toggling with custom context styling.
  - **Modern Typography & Layout**: Built with a gorgeous design system utilizing the *Plus Jakarta Sans* font family.
  - **NativeWind & Tailwind CSS**: Fluid and responsive layouts that match modern design aesthetics.

- **🛠️ Utility Features**
  - **Demo Mode**: One-tap demo toggle in settings to populate simulated subscriptions, skipping status, and dynamic mock analytics for immediate testing.
  - **Multi-Currency Support**: Switch between **USD**, **EUR**, **TRY**, and **JPY** with real-time conversion rates applied across the app.

---

## 🛠️ Tech Stack

- **Framework**: [Expo (v54)](https://docs.expo.dev/versions/v54.0.0/)
- **Core Library**: [React Native](https://reactnative.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [NativeWind (Tailwind CSS v4)](https://nativewind.dev/)
- **Authentication**: [Clerk Expo](https://clerk.com/docs/quickstarts/expo)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Date Utilities**: [Day.js](https://day.js.org/)
- **Storage**: [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/secure-store/) & [Async Storage](https://react-native-async-storage.github.io/async-storage/)

---

## 📂 Project Structure

```text
├── app/                      # Expo Router App Pages & Routing Groups
│   ├── (auth)/               # Authentication routing group (Sign In / Sign Up)
│   ├── (tabs)/               # Main application tabs navigation
│   │   ├── index.tsx         # Dashboard / Home Screen
│   │   ├── insights.tsx      # Spending Insights & Analytics Charts
│   │   ├── usage.tsx         # Subscription Usage Tracking
│   │   └── settings.tsx      # Settings & Profile Management Screen
│   ├── subscriptions/        # Dynamic subscription detail route
│   └── _layout.tsx           # Global Root Navigation & Context Providers
├── assets/                   # Fonts, custom icons, and static images
├── components/               # Shared reusable UI & Chart components
├── constants/                # App constants, mock data, and image paths
├── context/                  # Theme Context & Subscription State Management
├── hooks/                    # Custom application hooks (e.g. useClerkMetadata)
├── lib/                      # Helper methods and utility functions
├── tailwind.config.js        # NativeWind/Tailwind configuration
└── app.json                  # Expo project metadata and configuration
```

---

## 🚀 Local Setup & Installation

Follow these steps to run Subscrio locally in your development environment.

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or v20.x recommended)
- **npm** or **yarn**
- **Expo Go** app on your physical mobile device (available on [App Store](https://apps.apple.com/app/expo-go/id984021595) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)), or configured **iOS Simulator / Android Emulator**.

---

### 📥 1. Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/theomerkaratas/subscrio.git

# Navigate into the project folder
cd subscrio

# Install dependencies
npm install
```

---

### 🔑 2. Configure Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```
2. Retrieve your Clerk Publishable Key from your [Clerk Dashboard](https://dashboard.clerk.com/) and paste it into the file:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 📱 3. Start the Development Server

Start the Metro bundler server:
```bash
npx expo start
```

Alternatively, you can run on specific platforms:
- **iOS Simulator**: `npm run ios` (or press `i` in the terminal)
- **Android Emulator**: `npm run android` (or press `a` in the terminal)
- **Web Browser**: `npm run web` (or press `w` in the terminal)

---

### 📲 4. Open on a Physical Device

1. Make sure your computer and physical phone are connected to the **same Wi-Fi network**.
2. Run `npx expo start` and scan the printed **QR Code**:
   - **Android**: Open the **Expo Go** app and tap "Scan QR Code".
   - **iOS**: Open the native **Camera** app, scan the QR code, and tap the prompt to open in Expo Go.

---

## 🔒 Security & Clerk Configuration

Subscrio uses `@clerk/expo` for authentication. The token cache is persisted securely using `expo-secure-store`. Ensure that:
- Your Clerk instance has **Email/Password** or your desired social logins enabled in the Clerk Dashboard under **Authentication** > **User Authentication**.
- Redirect URIs are configured correctly if implementing OAuth providers.

---

## 🛡️ License

This project is private and proprietary. All rights reserved.
