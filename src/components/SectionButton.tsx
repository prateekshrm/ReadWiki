import Colors from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import Button from "./Button";

interface SectionButtonProps {
    text: string;
    onPress: () => void;
    iconName?: string;
    iconPosition?: "left" | "right";
    variant?: "primary" | "secondary";
}

const SectionButton = ({
    text,
    onPress,
    iconName = "arrow-right-s-line",
    iconPosition = "right",
    variant = "secondary",
}: SectionButtonProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Button
                text={text}
                iconName={iconName}
                iconPosition={iconPosition}
                variant={variant}
                onPress={onPress}
            />
        </View>
    );
};

export default SectionButton;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        paddingHorizontal: 16,
        gap: 12,
    },
    line: {
        flex: 1,
        height: 2,
        borderRadius: 100,
        backgroundColor: Colors.border,
    },
});
