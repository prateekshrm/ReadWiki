import { openDatabaseSync } from "expo-sqlite";

// A shared SQLite database for all app data that needs structured storage
// (saved articles, reading history, etc.). We open it synchronously at
// module-init time so every service can read from it immediately.

const db = openDatabaseSync("readwiki.db");

// Create tables if they don't already exist.
db.execSync(`
    CREATE TABLE IF NOT EXISTS saved_articles (
        title TEXT PRIMARY KEY NOT NULL,
        thumbnail TEXT,
        saved_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS article_history (
        title TEXT PRIMARY KEY NOT NULL,
        thumbnail TEXT,
        read_at INTEGER NOT NULL
    );
`);

export default db;
