import { useScreenScroll } from "@/components/HeaderScroll";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AUTHOR_NAME = "Prateek Sharma";
const AUTHOR_PORTFOLIO = "https://pratk.in";
const AUTHOR_GITHUB = "https://github.com/pratksharma";
const REPOSITORY_URL = "https://github.com/pratksharma/ReadWiki";
const AUTHOR_BIO = "Sofware Engineer";
const AUTHOR_AVATAR =
    "https://raw.githubusercontent.com/pratksharma/PariSar/refs/heads/main/mobile/assets/profile-icon.png";

export default function About() {
    const insets = useSafeAreaInsets();
    const onScroll = useScreenScroll();

    return (
        <Animated.ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                {
                    paddingBottom: insets.bottom + 32,
                },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
        >
            <View style={styles.header}>
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={styles.icon}
                />

                <Text style={styles.appName}>ReadWiki</Text>

                <Text style={styles.version}>v1.0.0</Text>

                <Pressable
                    style={styles.linkChip}
                    onPress={() => Linking.openURL(REPOSITORY_URL)}
                >
                    <RemixIcon
                        name="github-fill"
                        size={16}
                        color={Colors.text}
                    />
                    <Text style={styles.linkChipText}>GitHub</Text>
                </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Author</Text>
            <View style={styles.card}>
                <Image source={{ uri: AUTHOR_AVATAR }} style={styles.avatar} />

                <View style={styles.cardContent}>
                    <Text style={styles.name}>{AUTHOR_NAME}</Text>

                    <Text style={styles.bio}>{AUTHOR_BIO}</Text>

                    <Pressable
                        style={styles.authorLink}
                        onPress={() => Linking.openURL(AUTHOR_PORTFOLIO)}
                    >
                        <RemixIcon
                            name="global-line"
                            size={16}
                            color={Colors.accent}
                        />

                        <Text style={styles.authorLinkText}>
                            {AUTHOR_PORTFOLIO.replace(/^https?:\/\//, "")}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.authorLink}
                        onPress={() => Linking.openURL(AUTHOR_GITHUB)}
                    >
                        <RemixIcon
                            name="github-fill"
                            size={16}
                            color={Colors.accent}
                        />

                        <Text style={styles.authorLinkText}>@pratksharma</Text>
                    </Pressable>
                </View>
            </View>

            <Text style={styles.sectionTitle}>WikiPedia</Text>

            <Pressable
                style={styles.item}
                onPress={() => Linking.openURL("https://en.wikipedia.org")}
            >
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require("@/assets/wikipedia-icon.png")}
                            style={{ height: 24, width: 24 }}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Wikipedia</Text>
                        <Text style={styles.subtitle}>
                            Visit the Wikipedia website
                        </Text>
                    </View>
                </View>

                <RemixIcon
                    name="arrow-right-s-line"
                    size={22}
                    color={Colors.textSecondary}
                    fallback={null}
                />
            </Pressable>

            <Pressable
                style={styles.item}
                onPress={() =>
                    Linking.openURL("https://wikimediafoundation.org/support")
                }
            >
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require("@/assets/wikimedia-icon.png")}
                            style={{ height: 22, width: 22 }}
                        />
                    </View>

                    <View style={styles.itemTextWrap}>
                        <Text style={styles.title}>Support Wikipedia</Text>
                        <Text style={styles.subtitle}>
                            Donate or contribute to Wikipedia
                        </Text>
                    </View>
                </View>

                <RemixIcon
                    name="arrow-right-s-line"
                    size={22}
                    color={Colors.textSecondary}
                    fallback={null}
                />
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    ReadWiki is open source and uses the Wikimedia APIs to
                    provide access to Wikipedia content.
                </Text>

                <Text style={styles.copyright}>
                    © {new Date().getFullYear()} {AUTHOR_NAME}
                </Text>
            </View>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
        paddingTop: 120,
        paddingBottom: 32,
        gap: 12,
    },
    header: {
        alignItems: "center",
        marginBottom: 16,
    },
    icon: {
        width: 88,
        height: 88,
        borderRadius: 22,
        marginBottom: 14,
    },
    appName: {
        fontSize: 28,
        fontFamily: "DMSans-Bold",
        color: Colors.text,
    },
    version: {
        fontFamily: "DMSans-Medium",
        color: Colors.textSecondary,
    },
    linkChip: {
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: Colors.backgroundMuted,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
    },
    linkChipText: {
        fontFamily: "DMSans-Medium",
        color: Colors.text,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "DMSans-SemiBold",
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 8,
        marginLeft: 4,
    },
    card: {
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontFamily: "DMSans-Bold",
        color: Colors.text,
    },
    bio: {
        lineHeight: 20,
        marginTop: 8,
        color: Colors.text,
        fontFamily: "DMSans-Regular",
    },
    authorLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        alignSelf: "flex-start",
    },
    authorLinkText: {
        color: Colors.accent,
        fontFamily: "DMSans-Medium",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 16,
        backgroundColor: Colors.surface,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.backgroundMuted,
        marginRight: 14,
    },
    itemTextWrap: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
        fontFamily: "DMSans-Regular",
        color: Colors.textSecondary,
    },
    footer: {
        marginTop: 16,
        alignItems: "center",
    },
    footerText: {
        textAlign: "center",
        lineHeight: 22,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },
    copyright: {
        marginTop: 16,
        fontFamily: "DMSans-Medium",
        color: Colors.textSecondary,
    },
});
