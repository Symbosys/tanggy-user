import React, { useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import { SafeAreaView as SafeAreaViewBase } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { Linking } from "react-native";
import { COLORS, FONTS } from "../../theme/theme";
import { AppNavigation } from "../../types/type";

const { width: screenWidth } = Dimensions.get("window");

const GRADIENT_PAGE = [COLORS.secondary, COLORS.white];
const GRADIENT_HEADER = [COLORS.primary, COLORS.accent];
const GRADIENT_BUTTON = [COLORS.primary, COLORS.accent];
const GRADIENT_PROGRESS = [COLORS.primary, COLORS.accent];

const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.accent;
const BODY_TEXT = COLORS.textSecondary;
const WHITE_30 = "rgba(255, 255, 255, 0.3)";
const WHITE_80 = "rgba(255, 255, 255, 0.8)";
const GRAY_200_80 = "rgba(229, 231, 235, 0.8)";
const BODY_TEXT_80 = "rgba(74, 74, 74, 0.8)";
const BODY_TEXT_60 = "rgba(74, 74, 74, 0.6)";
const BODY_TEXT_50 = "rgba(74, 74, 74, 0.5)";

const PrivacyPolicy = ({ navigation }: AppNavigation) => {
    const [headerHeight, setHeaderHeight] = useState(72);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollY = contentOffset.y;
        const height = contentSize.height - layoutMeasurement.height;
        const calculatedProgress = height > 0 ? Math.min(scrollY / height, 1) : 1;
        setProgress(calculatedProgress);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleDownloadPress = () => {
        // Handle download
    };

    const handleAcceptPress = () => {
        // Handle accept and continue
    };

    const handleEmailPress = () => {
        Linking.openURL("mailto:support@mintafresh.com");
    };

    return (
        <LinearGradient
            colors={GRADIENT_PAGE}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            {/* Header */}
            <View
                style={styles.header}
                onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            >
                <LinearGradient
                    colors={GRADIENT_HEADER}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Privacy Policy</Text>
                        <TouchableOpacity style={styles.headerButton} onPress={handleDownloadPress}>
                            <Icon name="download" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Progress Bar */}
            <View
                style={[
                    styles.progressBar,
                    { top: headerHeight },
                ]}
            >
                <LinearGradient
                    colors={GRADIENT_PROGRESS}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>

            {/* Main Content */}
            <ScrollView
                ref={scrollRef}
                style={styles.main}
                contentContainerStyle={styles.mainContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Sub-header */}
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderText}>Your privacy and data protection are our top priorities.</Text>
                    <Text style={styles.lastUpdated}>Last updated on: 20 October 2025</Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Introduction */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>Introduction</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Welcome to MintaFresh. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully.
                        </Text>
                    </View>

                    {/* Information We Collect */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="storage" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>Information We Collect</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We may collect information about you in a variety of ways. The information we may collect via the Application includes personal data, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, and interests, that you voluntarily give to us when you register with the Application.
                        </Text>
                    </View>

                    {/* How We Use Your Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="settings" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to create and manage your account, process your orders, and deliver products to you.
                        </Text>
                    </View>

                    {/* Data Security */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="security" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>Data Security</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                        </Text>
                    </View>

                    {/* Contact Us */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="mail" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>Contact Us</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            If you have questions or comments about this Privacy Policy, please contact us at:{" "}
                            <TouchableOpacity onPress={handleEmailPress}>
                                <Text style={styles.emailLink}>support@mintafresh.com</Text>
                            </TouchableOpacity>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Header
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    headerGradient: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
        flex: 1,
        textAlign: "center",
    },
    // Progress Bar
    progressBar: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: WHITE_30,
        zIndex: 10,
    },
    progressFill: {
        height: "100%",
    },
    // Main
    main: {
        flex: 1,
        marginTop: 72, // Approximate header height
    },
    mainContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    // Sub-header
    subHeader: {
        paddingVertical: 24,
        alignItems: "center",
    },
    subHeaderText: {
        fontSize: 16,
        color: BODY_TEXT_80,
        textAlign: "center",
    },
    lastUpdated: {
        fontSize: 14,
        color: BODY_TEXT_60,
        textAlign: "center",
        marginTop: 8,
    },
    // Content Card
    contentCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 5,
        gap: 24,
    },
    section: {
        gap: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: PRIMARY_COLOR,
    },
    sectionText: {
        fontSize: 16,
        color: BODY_TEXT,
        lineHeight: 28,
    },
    emailLink: {
        color: PRIMARY_COLOR,
        fontWeight: "bold",
    },
});

export default PrivacyPolicy;