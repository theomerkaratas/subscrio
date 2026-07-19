export default {
  expo: {
    name: "subscrio",
    slug: "subscrio",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "subscrio",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "../assets/fonts/PlusJakartaSans-Bold.ttf",
            "../assets/fonts/PlusJakartaSans-Light.ttf",
            "../assets/fonts/PlusJakartaSans-Regular.ttf",
            "../assets/fonts/PlusJakartaSans-ExtraBold.ttf",
            "../assets/fonts/PlusJakartaSans-Medium.ttf",
            "../assets/fonts/PlusJakartaSans-SemiBold.ttf",
          ],
        },
      ],
      "expo-secure-store",
      "@clerk/expo",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "696247d1-9ead-46f5-b560-c71e531da0e3",
      },
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    },
    owner: "theomerkaratas",
  },
};
