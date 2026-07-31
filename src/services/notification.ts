import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Default",
                importance: Notifications.AndroidImportance.HIGH,
            });
        }

        return true;
    } catch (error) {
        console.warn("Failed to request notification permission:", error);
        return false;
    }
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

        const hasNotification = scheduled.some((notification) => {
            const trigger = notification.trigger;

            if (
                !trigger ||
                typeof trigger !== "object" ||
                !("date" in trigger)
            ) {
                return false;
            }

            const data = notification.content.data;

            if (data?.type !== "featured-article") {
                return false;
            }

            let dateObj: Date;
            const dateVal = (trigger as any).date;

            if (typeof dateVal === "number" || typeof dateVal === "string") {
                dateObj = new Date(dateVal);
            } else if (dateVal instanceof Date) {
                dateObj = dateVal;
            } else {
                return false;
            }

            return (
                dateObj.getFullYear() === tomorrow.getFullYear() &&
                dateObj.getMonth() === tomorrow.getMonth() &&
                dateObj.getDate() === tomorrow.getDate() &&
                dateObj.getHours() === 21 &&
                dateObj.getMinutes() === 0
            );
        });

        if (hasNotification) {
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

        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + 1);
        triggerDate.setHours(21, 0, 0, 0); // 9:00 PM next day

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
                date: triggerDate,
            },
        });

        console.log("Scheduled notification for", triggerDate);
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
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
            await scheduleTomorrowFeaturedNotification();
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
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
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
