import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type NotificationPreference = "granted" | "denied" | null;

// User settings that persist between app launches.
export type Preferences = {
    // Whether the user has finished the first-run onboarding screens.
    onboarded: boolean;
    // Reading text size for the article screen. 1 = normal.
    fontScale: number;
    // Open Wikipedia links inside the app (true) — kept as a setting so
    // it is easy to extend later.
    openLinksInApp: boolean;
    // User notification permission status. Defaults to null until asked on first launch.
    notificationPermission: NotificationPreference;
};

const STORAGE_KEY = "preferences";

const DEFAULTS: Preferences = {
    onboarded: false,
    fontScale: 1,
    openLinksInApp: true,
    notificationPermission: null,
};

// Available reading sizes shown in Settings.
export const FONT_SCALES = [
    { label: "Small", value: 0.9 },
    { label: "Default", value: 1 },
    { label: "Large", value: 1.15 },
    { label: "Extra Large", value: 1.3 },
];

// Start with defaults; we load the real values asynchronously below.
let preferences: Preferences = { ...DEFAULTS };
let loaded = false;

const listeners = new Set<() => void>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

// Load preferences from AsyncStorage on startup.
const loadPreferences = async () => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const stored = JSON.parse(raw) as Partial<Preferences>;
            preferences = { ...DEFAULTS, ...stored };
        }
    } catch (error) {
        console.log("Failed to load preferences:", error);
    } finally {
        loaded = true;
        emit();
    }
};

// Fire-and-forget load on module init.
loadPreferences();

export const getPreferences = () => preferences;

export const setPreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
) => {
    preferences = { ...preferences, [key]: value };
    emit();
    // Persist in the background — no need to await.
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)).catch(
        (error) => console.log("Failed to persist preferences:", error),
    );
};

export const completeOnboarding = () => setPreference("onboarded", true);

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const usePreferences = () => {
    return useSyncExternalStore(
        subscribe,
        () => preferences,
        () => preferences,
    );
};
