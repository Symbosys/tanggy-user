import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    View
} from "react-native";
import { COLORS } from "../../../theme/theme";

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

/**
 * A global loading overlay that:
 * - Always centers on screen
 * - Blocks all user interaction
 * - Works no matter where it's used (inside ScrollView, Modal, etc.)
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message = "Loading...",
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.text}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        width,
        height,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    loaderContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
});
