import { useScreenScroll } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import NewsCard from "@/components/NewsCard";
import Colors from "@/constants/Colors";
import { getFeaturedData } from "@/services/wikipedia";
import { stripHtml } from "@/utils/html";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const News = () => {
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<any[]>([]);
    const onScroll = useScreenScroll();

    const loadData = useCallback(async () => {
        try {
            const data = await getFeaturedData();
            setNews(data.news || []);
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
                data={news}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingBottom: insets.bottom + 32,
                    },
                ]}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => {
                    const article = item.links?.[0];

                    return (
                        <NewsCard
                            story={stripHtml(item.story)}
                            title={article?.normalizedtitle}
                            image={article?.thumbnail?.source}
                            onPress={() =>
                                article &&
                                router.push({
                                    pathname: "/article/[article]",
                                    params: {
                                        article: article.normalizedtitle,
                                    },
                                })
                            }
                        />
                    );
                }}
                keyExtractor={(item, index) => `${item.story}-${index}`}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default News;

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
    },
});
