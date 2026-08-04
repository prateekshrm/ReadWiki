import ArticleCard from "@/components/ArticleCard";
import { useScreenScroll } from "@/components/HeaderScroll";
import Colors from "@/constants/Colors";
import {
    clearHistory,
    formatTimeAgo,
    removeFromHistory,
    useHistory,
} from "@/services/articleHistory";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ClearButton = () => {
    const history = useHistory();

    if (history.length === 0) return null;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
            ]}
            onPress={() =>
                Alert.alert(
                    "Clear History",
                    "Remove all articles from your reading history?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Clear",
                            style: "destructive",
                            onPress: clearHistory,
                        },
                    ],
                )
            }
        >
            <RemixIcon
                name="delete-bin-line"
                size={20}
                color={Colors.text}
                fallback={null}
            />
        </Pressable>
    );
};

const History = () => {
    const history = useHistory();
    const insets = useSafeAreaInsets();
    const onScroll = useScreenScroll();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <ClearButton />,
        });
    }, [navigation]);

    if (history.length === 0) {
        return (
            <View style={styles.empty}>
                <RemixIcon
                    name="history-line"
                    size={48}
                    color={Colors.textMuted}
                    fallback={null}
                />
                <Text style={styles.emptyTitle}>No reading history</Text>
                <Text style={styles.emptySubtitle}>
                    Articles you read will show up here.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={history}
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
                        subtitle={formatTimeAgo(item.readAt)}
                        image={item.thumbnail}
                        onPress={() =>
                            router.push({
                                pathname: "/article/[article]",
                                params: { article: item.title },
                            })
                        }
                        onRemove={() => removeFromHistory(item.title)}
                        removeIcon="delete-bin-line"
                        removeIconColor={Colors.textMuted}
                    />
                )}
            />
        </View>
    );
};

export default History;

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
