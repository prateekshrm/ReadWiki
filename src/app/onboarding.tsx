import Colors from "@/constants/Colors";
import { completeOnboarding } from "@/services/preferences";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Image,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Onboarding = () => {
    const insets = useSafeAreaInsets();

    const finish = () => {
        completeOnboarding();

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(tabs)");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />

            <Image
                source={require("@/assets/onboarding.png")}
                style={styles.background}
                resizeMode="cover"
            />

            <LinearGradient
                colors={[
                    "transparent",
                    "rgba(0, 0, 0, 0.35)",
                    "rgba(0, 0, 0, 1)",
                ]}
                style={[styles.background]}
            />

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Image
                    source={require("@/assets/images/splash-icon.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    <Text style={styles.titleRegular}>Read</Text>
                    <Text style={styles.titleItalic}>Wiki</Text>
                </Text>

                <Text style={styles.description}>
                    A clean, modern way to explore Wikipedia — featured
                    articles, the image of the day and more, all in one place.
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={finish}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                    <RemixIcon
                        name="arrow-right-s-line"
                        size={20}
                        color="#000000"
                        fallback={null}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    background: {
        ...StyleSheet.absoluteFill,
        height: "100%",
        width: "100%",
        objectFit: "cover",
    },
    content: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    logo: {
        width: 72,
        height: 72,
        marginBottom: 4,
    },
    title: {
        fontSize: 32,
        color: Colors.textInverse,
        textAlign: "center",
        marginBottom: 24,
    },
    titleRegular: {
        fontFamily: "Fraunces-Medium",
    },
    titleItalic: {
        fontFamily: "Fraunces-MediumItalic",
    },
    description: {
        fontSize: 16,
        lineHeight: 25,
        fontFamily: "DMSans-Regular",
        color: "rgba(255, 255, 255, 0.85)",
        textAlign: "center",
        marginBottom: 40,
        paddingHorizontal: 8,
    },
    button: {
        width: "100%",
        height: 56,
        borderRadius: 999,
        backgroundColor: Colors.background,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 17,
        fontFamily: "DMSans-SemiBold",
        color: "#000000",
    },
});
