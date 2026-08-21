import {
    getArticleSummaryCache,
    getFeaturedDataCache,
    getFullArticleCache,
    setArticleSummaryCache,
    setFeaturedDataCache,
    setFullArticleCache,
} from "./cache";

const BASE_URL = "https://api.wikimedia.org";

export const getFeaturedData = async () => {
    try {
        const cachedData = getFeaturedDataCache();

        if (cachedData) {
            return cachedData;
        }

        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        const url = `${BASE_URL}/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "ReadWiki/1.0",
                "Api-User-Agent": "ReadWiki/1.0",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch featured content");
        }

        const data = await response.json();

        setFeaturedDataCache(data);

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getTomorrowFeaturedArticleTitle = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getDate()).padStart(2, "0");

        const url = `${BASE_URL}/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "ReadWiki/1.0",
                "Api-User-Agent": "ReadWiki/1.0",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch tomorrow's featured article");
        }

        const data = await response.json();

        return data.tfa.titles.normalized;
    } catch (error) {
        console.log(error);
        return null;
    }
};

// Fetches the clean article HTML from the MediaWiki "parse" endpoint.
// This returns standard HTML (real <img> tags and /wiki/ links) which is
// far easier to render nicely than the lazy-loaded mobile-html format.
export const getFullArticle = async (title: string) => {
    try {
        const cachedData = getFullArticleCache(title);

        if (cachedData) {
            return cachedData;
        }

        const encodedTitle = encodeURIComponent(title);

        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}` +
            `&prop=text&format=json&formatversion=2&redirects=1` +
            `&disableeditsection=1&disabletoc=1`,
            {
                headers: {
                    "User-Agent": "ReadWiki/1.0",
                    "Api-User-Agent": "ReadWiki/1.0",
                },
            },
        );

        const data = await response.json();
        const articleText = data?.parse?.text as string | undefined;

        if (articleText) {
            setFullArticleCache(title, articleText);
        }

        return articleText;
    } catch (error) {
        console.log(error);
    }
};

// Short summary of an article: title, one-line description, extract and
// lead image. Used for the article header and for saving articles.
export const getArticleSummary = async (title: string) => {
    try {
        const cachedData = getArticleSummaryCache(title);

        if (cachedData) {
            return cachedData;
        }

        const encodedTitle = encodeURIComponent(title);

        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`,
            {
                headers: {
                    "User-Agent": "ReadWiki/1.0",
                    "Api-User-Agent": "ReadWiki/1.0",
                },
            },
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        setArticleSummaryCache(title, data);

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const searchArticles = async (query: string) => {
    try {
        if (!query.trim()) {
            return [];
        }

        const encodedQuery = encodeURIComponent(query);

        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&generator=prefixsearch&description&prop=pageprops%7Cpageimages%7Cdescription&piprop=thumbnail&pithumbsize=128&gpslimit=6&format=json&formatversion=2&maxage=900&smaxage=900&gpssearch=${encodedQuery}`,
            {
                headers: {
                    "User-Agent": "ReadWiki/1.0",
                    "Api-User-Agent": "ReadWiki/1.0",
                },
            },
        );

        const data = await response.json();

        return data.query?.pages ?? [];
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const getRandomArticle = async () => {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/random/summary`,
            {
                headers: {
                    "User-Agent": "ReadWiki/1.0",
                    "Api-User-Agent": "ReadWiki/1.0",
                },
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch random article");
        }

        const article = await response.json();

        return article.title;
    } catch (error) {
        console.log(error);
        return [];
    }
};

export async function getRandomArticles(limit = 20) {
    const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts|info|pageimages&inprop=url|varianttitles&grnlimit=${limit}&exintro=1&exlimit=max&exsentences=5&explaintext=1&piprop=thumbnail&pithumbsize=800&origin=*`,
        {
            headers: {
                "User-Agent": "ReadWiki/1.0",
                "Api-User-Agent": "ReadWiki/1.0",
            },
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch random articles");
    }

    const data = await response.json();

    return Object.values(data.query?.pages ?? {});
}
