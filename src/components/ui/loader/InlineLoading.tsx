import React from "react";
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    Platform,
} from "react-native";
import { COLORS } from "../../../theme/theme";

interface InlineLoadingProps {
    visible: boolean;
    message?: string;
    size?: "small" | "large";
}

/**
 * Non-blocking loader that:
 * ✅ Always stays in the center of the screen
 * ✅ No overlay background
 * ✅ User can still interact with the screen
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({
    visible,
    message = "Loading...",
    size = "large",
}) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={COLORS.primary} />
            {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    text: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
