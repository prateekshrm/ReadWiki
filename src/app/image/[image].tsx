import { useSolidHeader } from "@/components/HeaderScroll";
import Loader from "@/components/Loader";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

const Image = () => {
    const { image } = useLocalSearchParams<{
        image: string;
    }>();
    const [isLoading, setIsLoading] = useState(true);

    // Full-screen dark viewer, so keep the header's back button white.
    useSolidHeader();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ExpoImage
                source={image}
                style={styles.backgroundImage}
                contentFit="cover"
                blurRadius={30}
            />
            <View style={styles.overlay} />
            <View style={styles.imageContainer}>
                {isLoading && (
                    <View style={styles.loaderContainer} pointerEvents="none">
                        <Loader />
                    </View>
                )}
                <ExpoImage
                    source={image}
                    style={styles.mainImage}
                    contentFit="contain"
                    transition={200}
                    onLoadEnd={() => setIsLoading(false)}
                />
            </View>
        </View>
    );
};

export default Image;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    backgroundImage: {
        ...StyleSheet.absoluteFill,
    },

    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.75)",
    },

    safeArea: {
        flex: 1,
    },

    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    loaderContainer: {
        ...StyleSheet.absoluteFill,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },

    mainImage: {
        width: "100%",
        height: "80%",
    },
});
