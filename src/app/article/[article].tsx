import { useScreenScroll } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import RichText from "@/components/RichText";
import Colors from "@/constants/Colors";
import { parseArticle, type Block } from "@/services/articleParser";
import { usePreferences } from "@/services/preferences";
import { addToHistory } from "@/services/articleHistory";
import { toggleSavedArticle, useIsSaved } from "@/services/savedArticles";
import { getArticleSummary, getFullArticle } from "@/services/wikipedia";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Metadata used for the article header and for saving the article.
type ArticleMeta = {
    title: string;
    description?: string;
    thumbnail?: string;
    heroImage?: string;
    heroWidth?: number;
    heroHeight?: number;
};

// Wikipedia thumbnails embed their width (e.g. ".../250px-Foo.jpg").
// Bump it up so the full-screen image viewer shows a sharp version.
const biggerImage = (src: string) => src.replace(/\/(\d+)px-/, "/1024px-");

const openImage = (src: string) => {
    router.push({
        pathname: "/image/[image]",
        params: { image: biggerImage(src) },
    });
};

// Header button that saves / unsaves the current article. Kept inside this
// file so it can share the loaded metadata.

const articleUrl = (item: any) =>
    item.fullurl ??
    item.canonicalurl ??
    `https://en.wikipedia.org/wiki/${encodeURIComponent(
        String(item.title).replace(/ /g, "_"),
    )}`;

const shareArticle = async (item: any) => {
    try {
        await Share.share({
            message: articleUrl(item),
            url: articleUrl(item),
            title: item.title,
        });
    } catch {
        // User dismissed the share sheet; nothing to do.
    }
};
const HeaderRight = ({ meta }: { meta: ArticleMeta }) => {
    const saved = useIsSaved(meta.title);

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
                style={({ pressed }) => [
                    styles.headerRightButton,
                    pressed && styles.headerRightButtonPressed,
                ]}
                onPress={() =>
                    toggleSavedArticle({
                        title: meta.title,
                        thumbnail: meta.thumbnail,
                        savedAt: Date.now(),
                    })
                }
            >
                <RemixIcon
                    name={saved ? "bookmark-fill" : "bookmark-line"}
                    size={20}
                    color={Colors.text}
                    fallback={null}
                />
            </Pressable>
            <Pressable
                style={({ pressed }) => [
                    styles.headerRightButton,
                    pressed && styles.headerRightButtonPressed,
                ]}
                onPress={() => shareArticle(meta)}
            >
                <RemixIcon
                    name={"share-line"}
                    size={20}
                    color={Colors.text}
                    fallback={null}
                />
            </Pressable>
        </View>
    );
};

const Article = () => {
    const { article } = useLocalSearchParams<{ article: string }>();
    const navigation = useNavigation();
    const preferences = usePreferences();
    const insets = useSafeAreaInsets();
    const onScroll = useScreenScroll();

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [meta, setMeta] = useState<ArticleMeta | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (article) {
            loadArticle();
        }
    }, [article]);

    // Once we know the article, show the save button in the header.
    useEffect(() => {
        if (meta) {
            navigation.setOptions({
                headerRight: () => <HeaderRight meta={meta} />,
            });
        }
    }, [meta, navigation]);

    const loadArticle = async () => {
        try {
            // Fetch the summary (title / lead image) and the full HTML together.
            const [summary, html] = await Promise.all([
                getArticleSummary(article),
                getFullArticle(article),
            ]);

            // Prefer the full-resolution image; fall back to the thumbnail.
            // Both carry their own width/height for the aspect ratio.
            const hero = summary?.originalimage ?? summary?.thumbnail;

            const articleMeta = {
                title: summary?.title ?? article,
                description: summary?.description ?? summary?.extract,
                thumbnail: summary?.thumbnail?.source,
                heroImage: hero?.source,
                heroWidth: hero?.width,
                heroHeight: hero?.height,
            };

            setMeta(articleMeta);

            // Track this article in reading history.
            addToHistory({
                title: articleMeta.title,
                thumbnail: articleMeta.thumbnail,
                readAt: Date.now(),
            });

            if (html) {
                setBlocks(parseArticle(html));
            }
        } catch (error) {
            console.log("Failed to load article:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <Loader />
            </View>
        );
    }

    const fontScale = preferences.fontScale;

    const renderBlock = (block: Block) => {
        switch (block.type) {
            case "heading":
                return (
                    <Text
                        style={[
                            block.level === 2
                                ? styles.heading2
                                : styles.heading3,
                            {
                                fontSize:
                                    (block.level === 2 ? 32 : 28) * fontScale,
                            },
                        ]}
                    >
                        {block.text}
                    </Text>
                );

            case "paragraph":
                return (
                    <RichText
                        spans={block.spans}
                        style={[
                            styles.paragraph,
                            {
                                fontSize: 17 * fontScale,
                                lineHeight: 28 * fontScale,
                            },
                        ]}
                    />
                );

            case "list":
                return (
                    <View style={styles.list}>
                        {block.items.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Text style={styles.bullet}>
                                    {block.ordered ? `${index + 1}.` : "•"}
                                </Text>
                                <RichText
                                    spans={item}
                                    style={[
                                        styles.paragraph,
                                        {
                                            flex: 1,
                                            marginBottom: 0,
                                            fontSize: 17 * fontScale,
                                            lineHeight: 28 * fontScale,
                                        },
                                    ]}
                                />
                            </View>
                        ))}
                    </View>
                );

            case "image": {
                const ratio =
                    block.width && block.height
                        ? block.width / block.height
                        : 3 / 2;

                return (
                    <View style={styles.figure}>
                        <Pressable onPress={() => openImage(block.src)}>
                            <Image
                                source={block.src}
                                style={[styles.image, { aspectRatio: ratio }]}
                                contentFit="cover"
                                transition={200}
                            />
                        </Pressable>
                        {!!block.caption && (
                            <Text style={styles.caption}>{block.caption}</Text>
                        )}
                    </View>
                );
            }

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={blocks}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={[
                    styles.content,
                    // With no hero image the title would sit under the transparent
                    // header, so push the content below it. Keep it immersive when
                    // there is a hero image.
                    !meta?.heroImage && { paddingTop: insets.top + 52 },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => renderBlock(item as Block)}
                ListHeaderComponent={
                    meta ? (
                        <View style={styles.header}>
                            {!!meta.heroImage && (
                                <Pressable
                                    onPress={() => openImage(meta.heroImage!)}
                                >
                                    <Image
                                        source={meta.heroImage}
                                        style={[
                                            styles.hero,
                                            {
                                                aspectRatio:
                                                    meta.heroWidth &&
                                                    meta.heroHeight
                                                        ? meta.heroWidth /
                                                          meta.heroHeight
                                                        : 3 / 2,
                                            },
                                        ]}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                </Pressable>
                            )}

                            <Text style={styles.title}>{meta.title}</Text>

                            {!!meta.description && (
                                <Text style={styles.description}>
                                    {meta.description}
                                </Text>
                            )}

                            <View style={styles.divider} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Article;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },

    content: {
        paddingBottom: 48,
    },

    header: {
        marginBottom: 8,
    },

    hero: {
        width: "100%",
        backgroundColor: Colors.backgroundMuted,
    },

    title: {
        fontSize: 34,
        lineHeight: 40,
        fontFamily: "Fraunces-Medium",
        color: Colors.text,
        paddingHorizontal: 16,
        marginTop: 20,
    },

    description: {
        fontSize: 16,
        fontFamily: "DMSans-Medium",
        color: Colors.textMuted,
        paddingHorizontal: 16,
        marginTop: 8,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginTop: 20,
        marginHorizontal: 16,
    },

    heading2: {
        fontFamily: "Fraunces-Medium",
        color: Colors.text,
        marginTop: 28,
        marginBottom: 12,
        paddingHorizontal: 16,
    },

    heading3: {
        fontFamily: "Fraunces-Medium",
        color: Colors.text,
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 16,
    },

    paragraph: {
        fontFamily: "DMSans-Regular",
        color: Colors.text,
        marginBottom: 16,
        paddingHorizontal: 16,
    },

    list: {
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },

    listItem: {
        flexDirection: "row",
        gap: 10,
    },

    bullet: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.textSecondary,
        fontSize: 17,
        lineHeight: 28,
    },

    figure: {
        marginVertical: 12,
    },

    image: {
        width: "100%",
        backgroundColor: Colors.backgroundMuted,
    },

    caption: {
        fontSize: 13,
        fontFamily: "DMSans-Regular",
        color: Colors.textMuted,
        paddingHorizontal: 16,
        marginTop: 8,
    },

    headerRightButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        backgroundColor: Colors.backgroundMuted,
    },

    headerRightButtonPressed: {
        filter: "brightness(0.9)",
        transform: [{ scale: 0.98 }],
    },
});
