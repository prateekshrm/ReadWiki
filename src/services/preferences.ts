import { useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage";

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

let preferences: Preferences = {
    ...DEFAULTS,
    ...readJSON<Partial<Preferences>>(STORAGE_KEY, {}),
};

const listeners = new Set<() => void>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

export const getPreferences = () => preferences;

export const setPreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
) => {
    preferences = { ...preferences, [key]: value };
    writeJSON(STORAGE_KEY, preferences);
    emit();
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
