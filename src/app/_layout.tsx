import Header from "@/components/Header";
import { HeaderScrollProvider } from "@/components/HeaderScroll";
import useNetworkAlert from "@/hooks/useNetworkAlert";
import {
    initializeNotifications,
    isExpoGo,
    registerNotificationResponseListener,
    setRouterReady,
} from "@/services/notification";
import { usePreferences } from "@/services/preferences";
import { useFonts } from "expo-font";
import { router, Stack, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";

import { Fraunces_500Medium } from "@expo-google-fonts/fraunces/500Medium";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useNetworkAlert();
    const preferences = usePreferences();
    const rootNavigationState = useRootNavigationState();
    const isNavigationReady = Boolean(rootNavigationState?.key);

    const [loaded, error] = useFonts({
        "DMSans-Regular": DMSans_400Regular,
        "DMSans-Medium": DMSans_500Medium,
        "DMSans-SemiBold": DMSans_600SemiBold,
        "DMSans-Bold": DMSans_700Bold,
        "Fraunces-Medium": Fraunces_500Medium,
    });

    useEffect(() => {
        if (loaded || error) {
            // Send first-time users to onboarding before showing the app.
            if (!preferences.onboarded) {
                router.replace("/onboarding");
            }

            void SplashScreen.hideAsync();
        }
        // Only run this decision once fonts have resolved.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, error]);

    useEffect(() => {
        if (!isExpoGo() && Platform.OS !== "web") {
            registerNotificationResponseListener();
            void initializeNotifications();
        }
    }, []);

    useEffect(() => {
        if (loaded && isNavigationReady) {
            setRouterReady(true);
        }
    }, [loaded, isNavigationReady]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <HeaderScrollProvider>
            <Stack
                screenOptions={{
                    headerTransparent: true,
                    header: ({ options, navigation }) => (
                        <Header
                            title={options.title ?? ""}
                            canGoBack={navigation.canGoBack()}
                            rightComponent={
                                options.headerRight?.({
                                    tintColor: "#fff",
                                    canGoBack: navigation.canGoBack(),
                                }) ?? null
                            }
                        />
                    ),
                    animation: "simple_push",
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="article/[article]"
                    options={{ title: "" }}
                />
                <Stack.Screen name="trending" options={{ title: "Trending" }} />
                <Stack.Screen name="news" options={{ title: "In the News" }} />
                <Stack.Screen
                    name="did-you-know"
                    options={{ title: "Did You Know?" }}
                />
                <Stack.Screen
                    name="on-this-day"
                    options={{ title: "On This Day" }}
                />
                <Stack.Screen
                    name="history"
                    options={{ title: "History" }}
                />
                <Stack.Screen
                    name="saved"
                    options={{ title: "Saved" }}
                />
                <Stack.Screen name="about" options={{ title: "About" }} />
            </Stack>
        </HeaderScrollProvider>
    );
}
