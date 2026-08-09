import ArticleCard from "@/components/ArticleCard";
import { useScreenScroll } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import Colors from "@/constants/Colors";
import { getFeaturedData } from "@/services/wikipedia";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Trending = () => {
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
    const onScroll = useScreenScroll();

    const loadData = useCallback(async () => {
        try {
            const data = await getFeaturedData();
            setTrendingArticles(data.mostread?.articles || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Loader />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={trendingArticles}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingBottom: insets.bottom + 32,
                    },
                ]}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                    <ArticleCard
                        tag={`${item.views.toLocaleString()} views`}
                        title={item.titles.normalized}
                        subtitle={item.extract}
                        image={item.thumbnail?.source}
                        onPress={() =>
                            router.push({
                                pathname: "/article/[article]",
                                params: {
                                    article: item.titles.normalized,
                                },
                            })
                        }
                    />
                )}
                keyExtractor={(item, index) =>
                    `${item.title}-${index}` || `${item.titles.normalized}`
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default Trending;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingTop: 100,
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        color: Colors.text,
        fontFamily: "DMSans-Bold",
        letterSpacing: -1,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Medium",
    },
});
