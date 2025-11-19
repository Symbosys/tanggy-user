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
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            presentationStyle="overFullScreen"
            pointerEvents="none" // allow touches through
        >
            <View style={styles.container} pointerEvents="none">
                <ActivityIndicator size={size} color={COLORS.primary} />
                {message ? <Text style={styles.text}>{message}</Text> : null}
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        // Perfect centering for both platforms
        paddingBottom: Platform.OS === "android" ? 0 : 0,
    },
    text: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textPrimary,
    },
});
