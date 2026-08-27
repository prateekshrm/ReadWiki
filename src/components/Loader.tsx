import Colors from "@/constants/Colors";
import { ContainedLoadingIndicator, Host } from "@expo/ui/jetpack-compose";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

const Loader = () => {
    if (Platform.OS === "ios") {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Host matchContents style={styles.host}>
                <ContainedLoadingIndicator
                    containerColor={Colors.primary}
                    color={Colors.background}
                />
            </Host>
        </View>
    );
};

export default Loader;

const styles = StyleSheet.create({
    container: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    host: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
});
