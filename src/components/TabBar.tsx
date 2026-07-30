import Colors from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HORIZONTAL_MARGIN = 32;
const CONTAINER_PADDING = 4;

export default function TabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    const tabWidth =
        (Dimensions.get("window").width -
            HORIZONTAL_MARGIN * 2 -
            CONTAINER_PADDING * 2) /
        state.routes.length;

    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withTiming(state.index * tabWidth, {
            duration: 400,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
    }, [state.index, tabWidth]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
    }));

    return (
        <View
            style={[
                styles.wrapper,
                {
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={[
                    styles.gradient,
                    {
                        height: insets.bottom + 80,
                    },
                ]}
            />

            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: tabWidth,
                        },
                        indicatorStyle,
                    ]}
                />

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const icon =
                        typeof options.tabBarIcon === "function"
                            ? options.tabBarIcon({
                                  focused: isFocused,
                                  color: isFocused
                                      ? Colors.textInverse
                                      : Colors.textMuted,
                                  size: 24,
                              })
                            : null;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={styles.tab}
                        >
                            {route.name === "flow" ? (
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        {
                                            color: isFocused
                                                ? Colors.textInverse
                                                : Colors.textMuted,
                                        },
                                    ]}
                                >
                                    {options.title || route.name}
                                </Text>
                            ) : (
                                icon
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },

    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },

    container: {
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: 999,
        padding: CONTAINER_PADDING,
        marginHorizontal: HORIZONTAL_MARGIN,
        marginBottom: 16,
        position: "relative",
    },

    indicator: {
        position: "absolute",
        top: CONTAINER_PADDING,
        bottom: CONTAINER_PADDING,
        left: CONTAINER_PADDING,
        borderRadius: 999,
        backgroundColor: Colors.primary,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        zIndex: 1,
    },

    tabLabel: {
        fontSize: 14,
        fontFamily: "DMSans-Medium",
    },
});
