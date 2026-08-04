import { useSyncExternalStore } from "react";
import db from "./database";

// Shape of a single saved article. We store only title + thumbnail
// (no description) to keep the data lean.
export type SavedArticle = {
    title: string;
    thumbnail?: string;
    savedAt: number;
};

// In-memory copy of the saved list. Loaded once from SQLite and kept in
// sync on every change so reads are instant.
let savedArticles: SavedArticle[] = db.getAllSync<SavedArticle>(
    "SELECT title, thumbnail, saved_at as savedAt FROM saved_articles ORDER BY saved_at DESC",
);

// Simple subscription system so React components re-render when the
// saved list changes (used by useSyncExternalStore below).
const listeners = new Set<() => void>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

export const isArticleSaved = (title: string) => {
    return savedArticles.some((article) => article.title === title);
};

export const saveArticle = (article: SavedArticle) => {
    if (isArticleSaved(article.title)) {
        return;
    }

    db.runSync(
        "INSERT OR REPLACE INTO saved_articles (title, thumbnail, saved_at) VALUES (?, ?, ?)",
        [article.title, article.thumbnail ?? null, article.savedAt],
    );

    // Newest saved articles go to the top of the list.
    savedArticles = [article, ...savedArticles];
    emit();
};

export const removeArticle = (title: string) => {
    db.runSync("DELETE FROM saved_articles WHERE title = ?", [title]);
    savedArticles = savedArticles.filter((article) => article.title !== title);
    emit();
};

export const clearSavedArticles = () => {
    db.runSync("DELETE FROM saved_articles");
    savedArticles = [];
    emit();
};

export const toggleSavedArticle = (article: SavedArticle) => {
    if (isArticleSaved(article.title)) {
        removeArticle(article.title);
    } else {
        saveArticle(article);
    }
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// Returns the full saved list and re-renders on change.
export const useSavedArticles = () => {
    return useSyncExternalStore(
        subscribe,
        () => savedArticles,
        () => savedArticles,
    );
};

// Returns whether a single article is saved and re-renders on change.
export const useIsSaved = (title: string) => {
    return useSyncExternalStore(
        subscribe,
        () => isArticleSaved(title),
        () => isArticleSaved(title),
    );
};
