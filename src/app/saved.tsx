import ArticleCard from "@/components/ArticleCard";
import { useScreenScroll } from "@/components/HeaderScroll";
import Colors from "@/constants/Colors";
import {
    clearSavedArticles,
    removeArticle,
    useSavedArticles,
} from "@/services/savedArticles";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ClearButton = () => {
    const savedArticles = useSavedArticles();

    if (savedArticles.length === 0) return null;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
            ]}
            onPress={() =>
                Alert.alert("Clear Saved", "Remove all saved articles?", [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Clear",
                        style: "destructive",
                        onPress: clearSavedArticles,
                    },
                ])
            }
        >
            <RemixIcon
                name="bookmark-2-line"
                size={20}
                color={Colors.text}
                fallback={null}
            />
        </Pressable>
    );
};

const Saved = () => {
    const savedArticles = useSavedArticles();
    const insets = useSafeAreaInsets();
    const onScroll = useScreenScroll();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <ClearButton />,
        });
    }, [navigation]);

    if (savedArticles.length === 0) {
        return (
            <View style={styles.empty}>
                <RemixIcon
                    name="bookmark-line"
                    size={48}
                    color={Colors.textMuted}
                    fallback={null}
                />
                <Text style={styles.emptyTitle}>No saved articles</Text>
                <Text style={styles.emptySubtitle}>
                    Tap the bookmark icon while reading an article to save it
                    here for later.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={savedArticles}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 32 },
                ]}
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.title}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ArticleCard
                        title={item.title}
                        image={item.thumbnail}
                        onPress={() =>
                            router.push({
                                pathname: "/article/[article]",
                                params: { article: item.title },
                            })
                        }
                        onRemove={() => removeArticle(item.title)}
                    />
                )}
            />
        </View>
    );
};

export default Saved;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    listContent: {
        paddingTop: 100,
    },

    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        backgroundColor: Colors.background,
    },

    emptyTitle: {
        marginTop: 16,
        fontSize: 20,
        fontFamily: "Fraunces-Medium",
        color: Colors.text,
    },

    emptySubtitle: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 14,
        lineHeight: 22,
        fontFamily: "DMSans-Regular",
        color: Colors.textMuted,
    },

    headerButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        backgroundColor: Colors.backgroundMuted,
    },

    headerButtonPressed: {
        filter: "brightness(0.9)",
        transform: [{ scale: 0.98 }],
    },
});
