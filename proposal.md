# Project Proposal: Subscrio

## Problem & Motivation
In the modern digital economy, consumers are increasingly overwhelmed by "subscription fatigue"—a fragmented landscape of recurring payments for software, media, and services. Because these subscriptions utilize auto-renewal mechanisms, users frequently lose track of their ongoing expenses, fail to cancel trial periods in time, and waste substantial financial resources on services they rarely or never utilize. A unified, mobile-first solution is crucial to help users reclaim financial oversight on their primary personal devices.

## What Does It Deliver?
Subscrio delivers a comprehensive mobile framework that enables users to track, analyze, and manage their subscription portfolios. Core offerings include:
* **Dynamic Ledger:** Tracking of both one-time and recurring (monthly/yearly) subscriptions with customizable billing cycles.
* **Month-by-Month Overview:** Real-time financial analysis forecasting upcoming liabilities and aggregate monthly burns.
* **Usage & Utility Reports:** Analytics mapping financial cost against actual usage levels to calculate a "value-for-money" ratio.
* **Adaptive Visual Engine:** A polished UI supporting seamless, responsive transitions between Light Mode and Dark Mode.

## Any Rivals?
The market consists of several products offering varying tracking features:
1. **Bobby (Subscription Tracker):** Highly clean and minimalist UI, but operates purely as a static ledger without usage tracking or deeper analytics.
2. **Rocket Money:** Feature-rich with automated bank account synchronization, but is limited geographically (primarily US/Canada), raises privacy concerns, and gates features behind a paywall.
3. **Subby:** Offers lightweight manual tracking, but lacks multi-device cross-platform depth and advanced utility reporting.

## What Makes My App Different from Rivals?
Subscrio bridges the gap between payment and actual utility through its proprietary **Usage Reports**. Instead of merely reporting *how much* money is spent, the application visualizes whether the user is getting their money's worth. For example, if a user has a year-long Spotify subscription but shows dangerously low actual usage, Subscrio explicitly visualizes this discrepancy, prompting them to cancel or downgrade to optimize their finances.

## Backend-Frontend Patterns
Subscrio utilizes a modern, decoupled client-server architecture:
* **Frontend:** A cross-platform mobile app built with React Native/Expo, utilizing a state management library (like Zustand or Context API) for immediate UI responses and local persistence (via SQLite) for offline-first capabilities.
* **Backend:** A RESTful API or Backend-as-a-Service (BaaS) providing secure data synchronization, using OAuth 2.0 / JWT for authentication and database encryption at rest to safeguard user details.

## Filtering User Experience
The user interface is designed for cognitive clarity and accessible navigation. It features multi-faceted filter and sort options, allowing users to organize subscriptions by cost, renewal date, custom categories, or utility levels. The design system uses dynamic color tokens to ensure smooth, eye-friendly transitions between Light and Dark modes.

## Future Work
The development roadmap focuses on two core enhancements to transition Subscrio into an active financial hub:
1. **In-App Payment Gateway:** Secure payment API integrations (e.g., Stripe, Google/Apple Pay) to let users pay, renew, or cancel subscriptions directly within the app.
2. **AI Recommendation Engine:** An automated engine that analyzes usage patterns over time, alerts users to underutilized services, and explicitly suggests optimal downgrade or cancellation strategies.
