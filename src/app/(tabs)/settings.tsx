import { useScreenScroll } from "@/components/HeaderScroll";
import Colors from "@/constants/Colors";
import {
    cancelAllNotifications,
    getNotificationPermissionStatus,
    isExpoGo,
    requestNotificationPermission,
    scheduleTomorrowFeaturedNotification,
    sendTestNotification,
} from "@/services/notification";
import {
    FONT_SCALES,
    setPreference,
    usePreferences,
} from "@/services/preferences";
import { clearSavedArticles, useSavedArticles } from "@/services/savedArticles";
import { Host, Switch as JetpackSwitch } from "@expo/ui/jetpack-compose";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import Animated from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
    const insets = useSafeAreaInsets();

    const preferences = usePreferences();
    const savedArticles = useSavedArticles();
    const onScroll = useScreenScroll();

    const [permissionStatus, setPermissionStatus] = useState<
        "granted" | "denied" | "undetermined" | "unsupported" | "loading"
    >("loading");
    const [sendingTest, setSendingTest] = useState(false);

    const checkPermission = async () => {
        const status = await getNotificationPermissionStatus();
        setPermissionStatus(status);
    };

    useEffect(() => {
        void checkPermission();
    }, []);

    const handleToggleNotification = async (value: boolean) => {
        if (isExpoGo()) {
            return;
        }

        if (value) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setPermissionStatus("granted");
                await scheduleTomorrowFeaturedNotification();
            } else {
                setPermissionStatus("denied");
            }
        } else {
            await cancelAllNotifications();
            setPermissionStatus("denied");
        }
    };

    const handleTestNotification = async () => {
        if (sendingTest) return;

        setSendingTest(true);
        try {
            const result = await sendTestNotification();
            Alert.alert(
                result.success ? "Test Notification" : "Notice",
                result.message,
            );
            void checkPermission();
        } finally {
            setSendingTest(false);
        }
    };

    const confirmClearSaved = () => {
        if (savedArticles.length === 0) {
            return;
        }

        Alert.alert(
            "Clear saved articles",
            `Remove all ${savedArticles.length} saved article(s)? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: clearSavedArticles,
                },
            ],
        );
    };

    const getPermissionSubtitle = () => {
        if (permissionStatus === "unsupported") {
            return "Not supported in Expo Go or Web";
        }
        if (permissionStatus === "granted") {
            return "Featured article notification enabled";
        }
        if (permissionStatus === "denied") {
            return "Permission denied. Tap switch to enable";
        }
        return "Receive featured article notifications";
    };

    return (
        <Animated.ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                {
                    paddingBottom: insets.bottom + 80,
                },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
        >
            {/* Reading text size */}
            <Text style={styles.sectionTitle}>Reading</Text>

            <View style={styles.card}>
                <Text style={styles.rowLabel}>Text size</Text>
                <Text style={styles.rowHint}>
                    Adjust how large article text appears.
                </Text>

                <View style={styles.chips}>
                    {FONT_SCALES.map((option) => {
                        const active = preferences.fontScale === option.value;

                        return (
                            <Pressable
                                key={option.label}
                                style={[
                                    styles.chip,
                                    active && styles.chipActive,
                                ]}
                                onPress={() =>
                                    setPreference("fontScale", option.value)
                                }
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        active && styles.chipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Notifications */}
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.item}>
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <RemixIcon
                            name="notification-4-line"
                            size={22}
                            color={Colors.accent}
                            fallback={null}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Daily Notifications</Text>
                        <Text style={styles.subtitle}>
                            {getPermissionSubtitle()}
                        </Text>
                    </View>
                </View>

                {Platform.OS === "android" ? (
                    <Host matchContents>
                        <JetpackSwitch
                            value={permissionStatus === "granted"}
                            onCheckedChange={handleToggleNotification}
                            enabled={
                                permissionStatus !== "unsupported" &&
                                permissionStatus !== "loading"
                            }
                            colors={{
                                checkedThumbColor: Colors.surface,
                                checkedTrackColor: Colors.primary,
                                uncheckedTrackColor: Colors.backgroundMuted,
                            }}
                        />
                    </Host>
                ) : (
                    <Switch
                        value={permissionStatus === "granted"}
                        onValueChange={handleToggleNotification}
                        disabled={
                            permissionStatus === "unsupported" ||
                            permissionStatus === "loading"
                        }
                        trackColor={{
                            false: Colors.backgroundMuted,
                            true: Colors.primary,
                        }}
                        thumbColor={Colors.surface}
                    />
                )}
            </View>

            <Pressable
                style={[
                    styles.item,
                    (sendingTest || permissionStatus === "unsupported") &&
                        styles.disabledItem,
                ]}
                onPress={handleTestNotification}
                disabled={sendingTest || permissionStatus === "unsupported"}
            >
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <RemixIcon
                            name="notification-badge-line"
                            size={22}
                            color={Colors.accent}
                            fallback={null}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Send Test Notification</Text>
                        <Text style={styles.subtitle}>
                            {permissionStatus === "unsupported"
                                ? "Not supported in Expo Go"
                                : "Trigger a test notification in 2 seconds"}
                        </Text>
                    </View>
                </View>
            </Pressable>

            {/* Library */}
            <Text style={styles.sectionTitle}>Library</Text>

            <Pressable style={styles.item} onPress={confirmClearSaved}>
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <RemixIcon
                            name="delete-bin-line"
                            size={22}
                            color={Colors.accent}
                            fallback={null}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Clear saved articles</Text>
                        <Text style={styles.subtitle}>
                            {savedArticles.length} saved
                        </Text>
                    </View>
                </View>
            </Pressable>

            {/* General */}
            <Text style={styles.sectionTitle}>General</Text>

            <Pressable
                style={styles.item}
                onPress={() => router.push("/onboarding")}
            >
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <RemixIcon
                            name="compass-3-line"
                            size={22}
                            color={Colors.accent}
                            fallback={null}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Getting started</Text>
                        <Text style={styles.subtitle}>
                            Replay the welcome tour
                        </Text>
                    </View>
                </View>

                <RemixIcon
                    name="arrow-right-s-line"
                    size={22}
                    color={Colors.textSecondary}
                    fallback={null}
                />
            </Pressable>

            <Pressable
                style={styles.item}
                onPress={() => router.push("/about")}
            >
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <RemixIcon
                            name="information-line"
                            size={22}
                            color={Colors.accent}
                            fallback={null}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>About</Text>
                        <Text style={styles.subtitle}>
                            Learn more about ReadWiki
                        </Text>
                    </View>
                </View>

                <RemixIcon
                    name="arrow-right-s-line"
                    size={22}
                    color={Colors.textSecondary}
                    fallback={null}
                />
            </Pressable>
        </Animated.ScrollView>
    );
};

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 16,
        paddingTop: 120,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "DMSans-SemiBold",
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 8,
        marginLeft: 4,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: Colors.surface,
    },
    rowLabel: {
        fontSize: 16,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
    rowHint: {
        marginTop: 2,
        fontSize: 13,
        fontFamily: "DMSans-Regular",
        color: Colors.textSecondary,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 14,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: Colors.backgroundMuted,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 14,
        fontFamily: "DMSans-Medium",
        color: Colors.text,
    },
    chipTextActive: {
        color: Colors.textInverse,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 16,
        backgroundColor: Colors.surface,
    },
    disabledItem: {
        opacity: 0.6,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.backgroundMuted,
        marginRight: 14,
    },
    itemTextWrap: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
        fontFamily: "DMSans-Regular",
        color: Colors.textSecondary,
    },
});
