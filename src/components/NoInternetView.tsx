import Button from "@/components/Button";
import Colors from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NoInternetViewProps {
    onRetry: () => void;
    title?: string;
    description?: string;
}

export default function NoInternetView({
    onRetry,
    title = "No Internet Connection",
    description = "Please check your Wi-Fi or mobile data connection and try again.",
}: NoInternetViewProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 60,
                    paddingBottom: insets.bottom + 80,
                },
            ]}
        >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <RemixIcon
                        name="wifi-off-line"
                        size={38}
                        color={Colors.accent}
                        fallback={null}
                    />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.buttonWrapper}>
                    <Button
                        text="Try Again"
                        iconName="refresh-line"
                        iconPosition="left"
                        variant="primary"
                        mode="dark"
                        onPress={onRetry}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: Colors.background,
    },
    card: {
        width: "100%",
        maxWidth: 340,
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.backgroundMuted,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: "Fraunces-Medium",
        color: Colors.text,
        textAlign: "center",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontFamily: "DMSans-Regular",
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonWrapper: {
        alignItems: "center",
    },
});
