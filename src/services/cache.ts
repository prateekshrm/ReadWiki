const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const MAX_ARTICLES_CACHE = 5;

let featuredDataCache: any = null;
let featuredDataCacheTime = 0;

interface CacheItem<T = any> {
    data: T;
    timestamp: number;
}

const fullArticleCache = new Map<string, CacheItem>();
const articleSummaryCache = new Map<string, CacheItem>();

export const getFeaturedDataCache = () => {
    const isExpired = Date.now() - featuredDataCacheTime > CACHE_DURATION;

    if (isExpired) {
        featuredDataCache = null;
        return null;
    }

    return featuredDataCache;
};

export const setFeaturedDataCache = (data: any) => {
    featuredDataCache = data;
    featuredDataCacheTime = Date.now();
};

export const clearFeaturedDataCache = () => {
    featuredDataCache = null;
    featuredDataCacheTime = 0;
};

export const getFullArticleCache = (title: string) => {
    const key = title.trim().toLowerCase();
    const item = fullArticleCache.get(key);

    if (!item) {
        return null;
    }

    const isExpired = Date.now() - item.timestamp > CACHE_DURATION;

    if (isExpired) {
        fullArticleCache.delete(key);
        return null;
    }

    fullArticleCache.delete(key);
    fullArticleCache.set(key, item);

    return item.data;
};

export const setFullArticleCache = (title: string, data: any) => {
    const key = title.trim().toLowerCase();

    if (fullArticleCache.has(key)) {
        fullArticleCache.delete(key);
    }

    fullArticleCache.set(key, {
        data,
        timestamp: Date.now(),
    });

    while (fullArticleCache.size > MAX_ARTICLES_CACHE) {
        const oldestKey = fullArticleCache.keys().next().value;
        if (oldestKey !== undefined) {
            fullArticleCache.delete(oldestKey);
        } else {
            break;
        }
    }
};

export const clearFullArticleCache = (title?: string) => {
    if (title) {
        fullArticleCache.delete(title.trim().toLowerCase());
    } else {
        fullArticleCache.clear();
    }
};

export const getArticleSummaryCache = (title: string) => {
    const key = title.trim().toLowerCase();
    const item = articleSummaryCache.get(key);

    if (!item) {
        return null;
    }

    const isExpired = Date.now() - item.timestamp > CACHE_DURATION;

    if (isExpired) {
        articleSummaryCache.delete(key);
        return null;
    }

    articleSummaryCache.delete(key);
    articleSummaryCache.set(key, item);

    return item.data;
};

export const setArticleSummaryCache = (title: string, data: any) => {
    const key = title.trim().toLowerCase();

    if (articleSummaryCache.has(key)) {
        articleSummaryCache.delete(key);
    }

    articleSummaryCache.set(key, {
        data,
        timestamp: Date.now(),
    });

    while (articleSummaryCache.size > MAX_ARTICLES_CACHE) {
        const oldestKey = articleSummaryCache.keys().next().value;
        if (oldestKey !== undefined) {
            articleSummaryCache.delete(oldestKey);
        } else {
            break;
        }
    }
};

export const clearArticleSummaryCache = (title?: string) => {
    if (title) {
        articleSummaryCache.delete(title.trim().toLowerCase());
    } else {
        articleSummaryCache.clear();
    }
};
