import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
    const profile = process.env.EAS_BUILD_PROFILE;

    const isDevelopment = profile === "development";
    const isPreview = profile === "preview";

    return {
        name: isDevelopment
            ? "ReadWiki (Dev)"
            : isPreview
              ? "ReadWiki (Preview)"
              : "ReadWiki",

        slug: "ReadWiki",
        version: "1.0.0",
        orientation: "portrait",

        icon: isDevelopment
            ? "./assets/images/icon-dev.png"
            : isPreview
              ? "./assets/images/icon-preview.png"
              : "./assets/images/icon.png",

        scheme: "readwiki",
        userInterfaceStyle: "automatic",

        ios: {
            icon: "./assets/expo.icon",
        },

        android: {
            adaptiveIcon: {
                backgroundColor: "#191919",
                foregroundImage: isDevelopment
                    ? "./assets/images/android-icon-foreground-dev.png"
                    : isPreview
                      ? "./assets/images/android-icon-foreground-preview.png"
                      : "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            predictiveBackGestureEnabled: false,
            package: isDevelopment
                ? "com.pratksharma.readwiki.dev"
                : isPreview
                  ? "com.pratksharma.readwiki.preview"
                  : "com.pratksharma.readwiki",
        },

        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },

        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    backgroundColor: "#f2f3e4",
                    android: {
                        image: "./assets/images/splash-icon.png",
                        imageWidth: 76,
                    },
                },
            ],
            "expo-image",
            [
                "expo-notifications",
                {
                    icon: "./assets/images/notification-icon.png",
                },
            ],
            "expo-sqlite",
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },

        extra: {
            router: {},
            eas: {
                projectId: "9dc82086-93fc-4f6c-babd-7f4ce00ca7f9",
            },
        },
    };
};
