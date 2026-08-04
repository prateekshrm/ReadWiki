import { useSyncExternalStore } from "react";
import db from "./database";

// Shape of a single history entry. We keep just enough to render a
// card in the Library tab and to re-open the article.
export type HistoryArticle = {
    title: string;
    thumbnail?: string;
    readAt: number;
};

// In-memory copy loaded once from SQLite. Newest entries first.
let historyArticles: HistoryArticle[] = db.getAllSync<HistoryArticle>(
    "SELECT title, thumbnail, read_at as readAt FROM article_history ORDER BY read_at DESC",
);

// Simple subscription system so React components re-render when the
// history changes (used by useSyncExternalStore below).
const listeners = new Set<() => void>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

/**
 * Add or update a history entry. If the article already exists in
 * history, it is moved to the top with an updated readAt timestamp.
 * Otherwise it is prepended.
 */
export const addToHistory = (article: HistoryArticle) => {
    db.runSync(
        "INSERT OR REPLACE INTO article_history (title, thumbnail, read_at) VALUES (?, ?, ?)",
        [article.title, article.thumbnail ?? null, article.readAt],
    );

    historyArticles = [
        article,
        ...historyArticles.filter((a) => a.title !== article.title),
    ];
    emit();
};

export const removeFromHistory = (title: string) => {
    db.runSync("DELETE FROM article_history WHERE title = ?", [title]);
    historyArticles = historyArticles.filter(
        (article) => article.title !== title,
    );
    emit();
};

export const clearHistory = () => {
    db.runSync("DELETE FROM article_history");
    historyArticles = [];
    emit();
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// Returns the full history list and re-renders on change.
export const useHistory = () => {
    return useSyncExternalStore(
        subscribe,
        () => historyArticles,
        () => historyArticles,
    );
};

/**
 * Format a timestamp into a human-friendly relative time string.
 *
 * - Less than 1 minute  → "Just now"
 * - Less than 1 hour    → "X min ago"
 * - Less than 1 day     → "X hours ago"
 * - Less than 7 days    → "X days ago"
 * - Older than 7 days   → Short date like "Jul 28"
 */
export const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;

    // Older than a week → show short date
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
