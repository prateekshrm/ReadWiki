import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";

export type OnThisDayPage = {
    title?: string;
    normalizedtitle?: string;
    thumbnail?: {
        source: string;
    };
    [key: string]: any;
};

type OnThisDayEventProps = {
    year: string | number;
    text: string;
    pages?: OnThisDayPage[];
    title?: string;
    image?: string;
    // Timeline flags so the connecting line stops at the first/last event.
    isFirst?: boolean;
    isLast?: boolean;
    onPressPage?: (page: OnThisDayPage) => void;
    onPress?: () => void;
};

export default function OnThisDayEvent({
    year,
    text,
    pages,
    title,
    image,
    isFirst,
    isLast,
    onPressPage,
    onPress,
}: OnThisDayEventProps) {
    const pageList: OnThisDayPage[] =
        pages && pages.length > 0
            ? pages
            : title
              ? [
                    {
                        normalizedtitle: title,
                        title: title,
                        thumbnail: image ? { source: image } : undefined,
                    },
                ]
              : [];

    return (
        <View style={[styles.row, isFirst && { marginTop: 12 }]}>
            <View style={styles.timeline}>
                {!isFirst && <View style={styles.lineTop} />}
                <View style={styles.dot} />
                {!isLast && <View style={styles.lineBottom} />}
            </View>

            <View
                style={[
                    styles.content,
                    isLast
                        ? {
                              paddingBottom: 0,
                          }
                        : {
                              paddingBottom: 28,
                          },
                ]}
            >
                <Text style={styles.year}>{year}</Text>
                <Text style={styles.text}>{text}</Text>

                {pageList.length > 0 && (
                    <View style={styles.pagesContainer}>
                        {pageList.map((article, index) => {
                            const articleTitle =
                                article.normalizedtitle || article.title;
                            const thumbnailSource = article.thumbnail?.source;

                            return (
                                <Pressable
                                    key={`${articleTitle}-${index}`}
                                    style={({ pressed }) => [
                                        styles.articleChip,
                                        pressed && styles.articleChipPressed,
                                    ]}
                                    onPress={() => {
                                        if (onPressPage) {
                                            onPressPage(article);
                                        } else if (onPress) {
                                            onPress();
                                        }
                                    }}
                                >
                                    {thumbnailSource ? (
                                        <Image
                                            source={thumbnailSource}
                                            style={styles.thumbnail}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <View style={styles.thumbnailFallback}>
                                            <RemixIcon
                                                name="file-list-2-line"
                                                size={18}
                                                color={Colors.textMuted}
                                                fallback={null}
                                            />
                                        </View>
                                    )}

                                    <Text
                                        style={styles.articleTitle}
                                        numberOfLines={1}
                                    >
                                        {articleTitle}
                                    </Text>

                                    <RemixIcon
                                        name="arrow-right-s-line"
                                        size={18}
                                        color={Colors.textSecondary}
                                        fallback={null}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const DOT_SIZE = 12;

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        paddingHorizontal: 16,
    },

    timeline: {
        width: 24,
        alignItems: "center",
    },

    lineTop: {
        width: 2,
        height: 8,
        backgroundColor: Colors.border,
    },

    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: Colors.primary,
    },

    lineBottom: {
        flex: 1,
        width: 2,
        backgroundColor: Colors.border,
    },

    content: {
        flex: 1,
        paddingLeft: 12,
    },

    year: {
        fontSize: 20,
        color: Colors.text,
        fontFamily: "Fraunces-Medium",
        lineHeight: 22,
    },

    text: {
        marginTop: 4,
        color: Colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        fontFamily: "DMSans-Medium",
    },

    pagesContainer: {
        marginTop: 12,
        gap: 8,
    },

    articleChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 8,
        paddingRight: 12,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },

    articleChipPressed: {
        filter: "brightness(0.95)",
    },

    thumbnail: {
        width: 36,
        height: 36,
        borderRadius: 8,
    },

    thumbnailFallback: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.backgroundMuted,
        alignItems: "center",
        justifyContent: "center",
    },

    articleTitle: {
        flex: 1,
        color: Colors.text,
        fontSize: 14,
        fontFamily: "DMSans-SemiBold",
    },
});
