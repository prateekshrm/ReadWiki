import { useScreenScroll } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import OnThisDayEvent from "@/components/OnThisDayEvent";
import Colors from "@/constants/Colors";
import { getFeaturedData } from "@/services/wikipedia";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OnThisDay = () => {
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [onThisDayArticles, setOnThisDayArticles] = useState<any[]>([]);
    const onScroll = useScreenScroll();

    const loadData = useCallback(async () => {
        try {
            const data = await getFeaturedData();
            setOnThisDayArticles(data.onthisday || []);
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
                data={onThisDayArticles}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingBottom: insets.bottom + 32,
                    },
                ]}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                    return (
                        <OnThisDayEvent
                            year={item.year}
                            text={item.text}
                            pages={item.pages}
                            isFirst={index === 0}
                            isLast={index === onThisDayArticles.length - 1}
                            onPressPage={(article) => {
                                const target =
                                    article?.normalizedtitle || article?.title;
                                if (target) {
                                    router.push({
                                        pathname: "/article/[article]",
                                        params: {
                                            article: target,
                                        },
                                    });
                                }
                            }}
                        />
                    );
                }}
                keyExtractor={(item, index) =>
                    `${item.text}-${index}` ||
                    `${item.pages?.[0].title}-${index}`
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default OnThisDay;

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
