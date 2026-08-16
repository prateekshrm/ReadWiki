import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getPreferences, setPreference } from "./preferences";
import { getTomorrowFeaturedArticleTitle } from "./wikipedia";

export const isExpoGo = (): boolean => {
    return (
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
        (Constants as any).appOwnership === "expo"
    );
};

if (!isExpoGo() && Platform.OS !== "web") {
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
}

export const getNotificationPermissionStatus = async (): Promise<
    Notifications.PermissionStatus | "unsupported"
> => {
    if (isExpoGo() || Platform.OS === "web") {
        return "unsupported";
    }

    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status;
    } catch (error) {
        console.warn("Failed to get notification permissions:", error);
        return "unsupported";
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (isExpoGo() || Platform.OS === "web") {
        return false;
    }

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

const getTriggerTimestampMs = (trigger: any): number | null => {
    if (!trigger) return null;

    if (typeof trigger === "number") {
        return trigger < 1e11 ? trigger * 1000 : trigger;
    }

    if (trigger.dateComponents) {
        const { year, month, day, hour, minute, second } = trigger.dateComponents;
        if (year != null && month != null && day != null) {
            return new Date(
                year,
                month - 1,
                day,
                hour ?? 0,
                minute ?? 0,
                second ?? 0,
            ).getTime();
        }
    }

    const val = trigger.date ?? trigger.timestamp ?? trigger.value;

    if (typeof val === "number") {
        return val < 1e11 ? val * 1000 : val;
    }

    if (typeof val === "string") {
        const parsed = new Date(val).getTime();
        return isNaN(parsed) ? null : parsed;
    }

    if (val instanceof Date) {
        return val.getTime();
    }

    return null;
};

export const scheduleTomorrowFeaturedNotification = async () => {
    if (isExpoGo() || Platform.OS === "web") {
        return;
    }

    try {
        const status = await getNotificationPermissionStatus();
        if (status !== Notifications.PermissionStatus.GRANTED) {
            return;
        }

        const scheduled =
            await Notifications.getAllScheduledNotificationsAsync();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM next day

        const featuredNotifications = scheduled.filter(
            (n) => n.content?.data?.type === "featured-article",
        );

        let validScheduledCount = 0;
        const notificationsToCancel: string[] = [];

        for (const notification of featuredNotifications) {
            const triggerMs = getTriggerTimestampMs(notification.trigger);
            let isTomorrow9AM = false;

            if (triggerMs != null && !isNaN(triggerMs)) {
                const dateObj = new Date(triggerMs);
                isTomorrow9AM =
                    dateObj.getFullYear() === tomorrow.getFullYear() &&
                    dateObj.getMonth() === tomorrow.getMonth() &&
                    dateObj.getDate() === tomorrow.getDate();
            }

            if (isTomorrow9AM && validScheduledCount === 0) {
                // Keep the single valid scheduled notification for tomorrow
                validScheduledCount++;
            } else {
                // Collect old, stale, or duplicate notifications for cancellation
                if (notification.identifier) {
                    notificationsToCancel.push(notification.identifier);
                }
            }
        }

        // Cancel duplicates / stale notifications
        for (const id of notificationsToCancel) {
            await Notifications.cancelScheduledNotificationAsync(id);
        }

        if (validScheduledCount > 0) {
            console.log(
                "Tomorrow's featured article notification is already scheduled.",
            );
            return;
        }

        const title = await getTomorrowFeaturedArticleTitle();

        if (!title) {
            console.log(
                "No tomorrow featured article title received from API.",
            );
            return;
        }

        await Notifications.scheduleNotificationAsync({
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
                date: tomorrow,
            },
        });

        console.log("Scheduled notification for", tomorrow);
    } catch (error) {
        console.warn(
            "Failed to schedule tomorrow featured notification:",
            error,
        );
    }
};

export const initializeNotifications = async () => {
    if (isExpoGo() || Platform.OS === "web") {
        return;
    }

    try {
        const prefs = getPreferences();

        if (prefs.notificationPermission === null) {
            // First time opening app: ask for permission
            const hasPermission = await requestNotificationPermission();
            setPreference(
                "notificationPermission",
                hasPermission ? "granted" : "denied",
            );
            if (hasPermission) {
                await scheduleTomorrowFeaturedNotification();
            }
        } else {
            // Never ask for permission again on launch, but check OS status and schedule if granted
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
    }
};

export const sendTestNotification = async (): Promise<{
    success: boolean;
    message: string;
}> => {
    if (isExpoGo() || Platform.OS === "web") {
        return {
            success: false,
            message: "Notifications are not supported in Expo Go or Web.",
        };
    }

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
    if (isExpoGo() || Platform.OS === "web") return;
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.warn("Failed to cancel notifications:", error);
    }
};
