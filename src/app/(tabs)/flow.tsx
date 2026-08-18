import { useSolidHeader } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import Colors from "@/constants/Colors";
import { toggleSavedArticle, useIsSaved } from "@/services/savedArticles";
import { getRandomArticles } from "@/services/wikipedia";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height } = Dimensions.get("screen");

const BATCH_SIZE = 20;

// Build a canonical Wikipedia URL for sharing. The random-article query returns
// `fullurl`, but fall back to constructing one from the title just in case.
const articleUrl = (item: any) =>
    item.fullurl ??
    item.canonicalurl ??
    `https://en.wikipedia.org/wiki/${encodeURIComponent(
        String(item.title).replace(/ /g, "_"),
    )}`;

// A translucent circular action button (save / share).
const CircleButton = ({
    icon,
    onPress,
}: {
    icon: string;
    onPress: () => void;
}) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.circle,
            pressed && styles.circlePressed,
        ]}
        hitSlop={8}
    >
        <RemixIcon
            name={icon as any}
            size={22}
            color={Colors.textInverse}
            fallback={null}
        />
    </Pressable>
);

// Save button lives in its own component so it can subscribe to the saved store
// and flip its icon the moment the article is bookmarked.
const SaveButton = ({ item }: { item: any }) => {
    const saved = useIsSaved(item.title);

    return (
        <CircleButton
            icon={saved ? "bookmark-fill" : "bookmark-line"}
            onPress={() =>
                toggleSavedArticle({
                    title: item.title,
                    thumbnail: item.thumbnail?.source,
                    savedAt: Date.now(),
                })
            }
        />
    );
};

// Gently bobbing "swipe up" hint shown on the first card only.
const SwipeHint = () => {
    const offset = useSharedValue(0);

    useEffect(() => {
        offset.value = withRepeat(
            withTiming(-8, {
                duration: 900,
                easing: Easing.inOut(Easing.quad),
            }),
            -1,
            true,
        );
    }, [offset]);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
    }));

    return (
        <Animated.View style={[styles.hint, style]} pointerEvents="none">
            <RemixIcon
                name="arrow-up-double-line"
                size={18}
                color="rgba(255,255,255,0.85)"
                fallback={null}
            />
            <Text style={styles.hintText}>Swipe for more</Text>
        </Animated.View>
    );
};

const Flow = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const insets = useSafeAreaInsets();

    // Flow is a full-screen dark pager, so keep the header in its white state.
    useSolidHeader();

    const preloadImages = async (items: any[]) => {
        const urls = items
            .map((item) => item.thumbnail?.source)
            .filter(Boolean);

        if (urls.length) {
            await Image.prefetch(urls);
        }
    };

    const loadInitial = async () => {
        try {
            const data = await getRandomArticles(BATCH_SIZE);
            await preloadImages(data);
            setArticles(data);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore) return;

        setLoadingMore(true);

        try {
            const more = await getRandomArticles(BATCH_SIZE);
            await preloadImages(more);
            setArticles((prev) => [...prev, ...more]);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitial();
    }, []);

    const openArticle = useCallback((title: string) => {
        router.push({
            pathname: "/article/[article]",
            params: { article: title },
        });
    }, []);

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

    const renderItem = useCallback(
        ({ item, index }: any) => {
            const thumbnail = item.thumbnail?.source;

            return (
                <View style={styles.page}>
                    <Image
                        source={
                            thumbnail
                                ? thumbnail
                                : require("../../../assets/fallback.jpg")
                        }
                        style={styles.background}
                        contentFit="cover"
                        blurRadius={100}
                    />

                    {/* Flat dark overlay over every blurred backdrop so the
                        blur reads consistently regardless of the image. */}
                    <View style={styles.overlay} />

                    {/* Top scrim keeps the header/status bar legible; the
                        stronger bottom scrim anchors the text. */}
                    <LinearGradient
                        colors={["rgba(0,0,0,0.5)", "transparent"]}
                        style={styles.topScrim}
                    />
                    <LinearGradient
                        colors={[
                            "transparent",
                            "rgba(0,0,0,0.5)",
                            "rgba(0,0,0,0.92)",
                        ]}
                        locations={[0, 0.45, 1]}
                        style={styles.bottomScrim}
                    />

                    <View
                        style={[
                            styles.content,
                            {
                                paddingBottom: insets.bottom + 100,
                            },
                        ]}
                    >
                        {thumbnail && (
                            <View style={styles.imageCard}>
                                <Image
                                    source={{ uri: thumbnail }}
                                    contentFit="cover"
                                    style={styles.thumbnail}
                                    transition={200}
                                />
                            </View>
                        )}

                        <Text style={styles.title} numberOfLines={2}>
                            {item.title}
                        </Text>

                        <Text style={styles.extract} numberOfLines={4}>
                            {item.extract}
                        </Text>

                        <View style={styles.actions}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.readButton,
                                    pressed && styles.readButtonPressed,
                                ]}
                                onPress={() => openArticle(item.title)}
                            >
                                <Text style={styles.readButtonText}>
                                    Read Article
                                </Text>
                                <RemixIcon
                                    name="arrow-right-s-line"
                                    size={18}
                                    color={Colors.text}
                                    fallback={null}
                                />
                            </Pressable>

                            <SaveButton item={item} />

                            <CircleButton
                                icon="share-line"
                                onPress={() => shareArticle(item)}
                            />
                        </View>
                    </View>

                    {index === 0 && <SwipeHint />}
                </View>
            );
        },
        [openArticle, shareArticle],
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <Image
                    source={require("../../../assets/fallback.jpg")}
                    style={styles.background}
                    contentFit="cover"
                    transition={200}
                    blurRadius={100}
                />
                <View style={styles.overlay} />
                <Loader />
            </View>
        );
    }

    return (
        <FlatList
            data={articles}
            renderItem={renderItem}
            keyExtractor={(item) => item.pageid.toString()}
            pagingEnabled
            decelerationRate="fast"
            snapToAlignment="start"
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={3}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews
            getItemLayout={(_, index) => ({
                length: height,
                offset: height * index,
                index,
            })}
            ListFooterComponent={
                loadingMore ? (
                    <View style={styles.loading}>
                        <Image
                            source={require("../../../assets/fallback.jpg")}
                            style={styles.background}
                            contentFit="cover"
                            transition={200}
                            blurRadius={100}
                        />
                        <View style={styles.overlay} />
                        <Loader />
                    </View>
                ) : null
            }
        />
    );
};

export default Flow;

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        height,
        justifyContent: "center",
        alignItems: "center",
    },

    page: {
        flex: 1,
        height,
        justifyContent: "flex-end",
    },

    background: {
        ...StyleSheet.absoluteFill,
    },

    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,.55)",
    },

    topScrim: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "22%",
    },

    bottomScrim: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "80%",
    },

    content: {
        paddingHorizontal: 20,
        gap: 14,
    },

    imageCard: {
        alignSelf: "flex-start",
        width: "70%",
        height: 260,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        backgroundColor: "rgba(255,255,255,0.06)",
    },

    thumbnail: {
        width: "100%",
        height: "100%",
    },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },

    badgeText: {
        textTransform: "uppercase",
        fontSize: 11,
        letterSpacing: 1,
        fontFamily: "DMSans-Bold",
        color: Colors.textInverse,
    },

    title: {
        color: Colors.textInverse,
        fontSize: 28,
        letterSpacing: -0.5,
        fontFamily: "Fraunces-Medium",
    },

    extract: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "DMSans-Medium",
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 6,
    },

    readButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.surface,
        paddingVertical: 14,
        borderRadius: 999,
    },

    readButtonPressed: {
        filter: "brightness(0.9)",
        transform: [{ scale: 0.98 }],
    },

    readButtonText: {
        fontFamily: "DMSans-SemiBold",
        fontSize: 15,
        color: Colors.text,
    },

    circle: {
        width: 52,
        height: 52,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.14)",
    },

    circlePressed: {
        opacity: 0.7,
        transform: [{ scale: 0.94 }],
    },

    hint: {
        position: "absolute",
        top: "14%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    hintText: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        fontFamily: "DMSans-SemiBold",
    },
});
