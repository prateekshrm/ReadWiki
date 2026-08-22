import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Href, router } from "expo-router";
import { Platform } from "react-native";

import { getPreferences, setPreference } from "./preferences";
import { getTomorrowFeaturedArticleTitle } from "./wikipedia";

const FEATURED_NOTIFICATION_DATE_KEY = "featuredNotificationDate";
const FEATURED_NOTIFICATION_ID = "featured-article";

try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
} catch (error) {
    console.warn("Failed to set notification handler:", error);
}

export const getLocalYYYYMMDD = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const getTomorrow9AM = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
};

export const getNotificationPermissionStatus = async (): Promise<
    Notifications.PermissionStatus | "unsupported"
> => {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status;
    } catch (error) {
        console.warn("Failed to get notification permissions:", error);
        return "unsupported";
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.HIGH,
            });
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
            return false;
        }

        return true;
    } catch (error) {
        console.warn("Failed to request notification permission:", error);
        return false;
    }
};

export const scheduleTomorrowFeaturedNotification = async () => {
    try {
        const status = await getNotificationPermissionStatus();
        if (status !== Notifications.PermissionStatus.GRANTED) {
            return;
        }

        const tomorrowDate = getTomorrow9AM();
        const tomorrowStr = getLocalYYYYMMDD(tomorrowDate);

        const storedDate = await AsyncStorage.getItem(
            FEATURED_NOTIFICATION_DATE_KEY,
        );

        // Case 2: Stored date is tomorrow -> Do nothing (idempotent)
        if (storedDate === tomorrowStr) {
            console.log(
                "Tomorrow's featured article notification is already scheduled.",
            );
            return;
        }

        // Case 1 (no date), Case 3 (storedDate === todayStr), Case 4 (storedDate < todayStr):
        // Cancel existing scheduled featured-article notification as safety measure
        try {
            await Notifications.cancelScheduledNotificationAsync(
                FEATURED_NOTIFICATION_ID,
            );
        } catch {
            // Ignore if identifier not found
        }

        const title = await getTomorrowFeaturedArticleTitle();

        if (!title) {
            console.log(
                "No tomorrow featured article title received from API.",
            );
            return;
        }

        await Notifications.scheduleNotificationAsync({
            identifier: FEATURED_NOTIFICATION_ID,
            content: {
                title: title,
                body: "Tap to read today's featured article.",
                data: {
                    type: "featured-article",
                    href: `/article/${encodeURIComponent(title)}`,
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: tomorrowDate,
            },
        });

        await AsyncStorage.setItem(
            FEATURED_NOTIFICATION_DATE_KEY,
            tomorrowStr,
        );
        console.log(
            `Scheduled notification for tomorrow (${tomorrowStr} 9:00 AM) with title: ${title}`,
        );
    } catch (error) {
        console.warn(
            "Failed to schedule tomorrow featured notification:",
            error,
        );
    }
};

let isInitializing = false;

export const initializeNotifications = async () => {
    if (isInitializing) {
        return;
    }
    isInitializing = true;

    try {
        const prefs = getPreferences();

        if (!prefs.onboarded) {
            return;
        }

        if (prefs.notificationPermission === null) {
            // First time opening app (after onboarding): ask for permission
            const hasPermission = await requestNotificationPermission();
            setPreference(
                "notificationPermission",
                hasPermission ? "granted" : "denied",
            );
            if (hasPermission) {
                await scheduleTomorrowFeaturedNotification();
            }
        } else {
            // Check OS status and schedule if granted
            const status = await getNotificationPermissionStatus();
            if (status !== "unsupported") {
                const isGranted =
                    status === Notifications.PermissionStatus.GRANTED;
                setPreference(
                    "notificationPermission",
                    isGranted ? "granted" : "denied",
                );
                if (isGranted) {
                    await scheduleTomorrowFeaturedNotification();
                }
            }
        }
    } catch (error) {
        console.warn("Failed to initialize notifications:", error);
    } finally {
        isInitializing = false;
    }
};

// --- Cold-start & notification tap response navigation manager ---
let pendingHref: Href | null = null;
let isRouterReady = false;
const handledResponseIdentifiers = new Set<string>();
let isListenerRegistered = false;

const processPendingNavigation = () => {
    if (isRouterReady && pendingHref) {
        const targetHref = pendingHref;
        pendingHref = null; // Clear first to prevent duplicate navigation
        router.push(targetHref);
    }
};

export const setRouterReady = (ready: boolean) => {
    isRouterReady = ready;
    if (ready) {
        processPendingNavigation();
    }
};

export const handleNotificationResponse = (
    response: Notifications.NotificationResponse | null,
) => {
    if (!response?.notification) return;

    const identifier = response.notification.request.identifier;
    if (handledResponseIdentifiers.has(identifier)) {
        return;
    }

    const data = response.notification.request.content.data;
    if (
        data &&
        data.type === "featured-article" &&
        typeof data.href === "string"
    ) {
        handledResponseIdentifiers.add(identifier);
        pendingHref = data.href as Href;
        try {
            Notifications.clearLastNotificationResponse();
        } catch {
            // Ignore if clearing last response is unsupported
        }
        processPendingNavigation();
    }
};

export const registerNotificationResponseListener = () => {
    if (isListenerRegistered) return;
    isListenerRegistered = true;

    try {
        Notifications.addNotificationResponseReceivedListener((response) => {
            handleNotificationResponse(response);
        });

        const lastResponse = Notifications.getLastNotificationResponse();
        if (lastResponse) {
            handleNotificationResponse(lastResponse);
        }
    } catch (error) {
        console.warn(
            "Failed to register notification response listener:",
            error,
        );
    }
};

export const sendTestNotification = async (): Promise<{
    success: boolean;
    message: string;
}> => {
    try {
        const status = await getNotificationPermissionStatus();
        const isGranted = status === Notifications.PermissionStatus.GRANTED;
        setPreference(
            "notificationPermission",
            isGranted ? "granted" : "denied",
        );

        if (!isGranted) {
            return {
                success: false,
                message:
                    "Notification permission is not granted. Please enable notifications in your device settings.",
            };
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Notification",
                body: "This is a test notification from ReadWiki!",
                data: { type: "test" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 2,
            },
        });

        return {
            success: true,
            message:
                "Test notification scheduled! It will appear in 2 seconds.",
        };
    } catch (error: any) {
        console.warn("Error sending test notification:", error);
        return {
            success: false,
            message: `Failed to send test notification: ${error?.message || "Unknown error"}`,
        };
    }
};

export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.removeItem(FEATURED_NOTIFICATION_DATE_KEY);
    } catch (error) {
        console.warn("Failed to cancel notifications:", error);
    }
};
