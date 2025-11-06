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
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
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

const TermsAndConditions = ({ navigation }: AppNavigation) => {
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
                        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
                    <Text style={styles.subHeaderText}>Our terms and conditions outline the rules for using MintaFresh.</Text>
                    <Text style={styles.lastUpdated}>Last Updated: 12 October 2023</Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Introduction */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. Introduction</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Welcome to MintaFresh. These terms and conditions outline the rules and regulations for the use of our application and services. By accessing this app, we assume you accept these terms and conditions. Do not continue to use MintaFresh if you do not agree to all of the terms and conditions stated on this page.
                        </Text>
                    </View>

                    {/* User Account & Responsibilities */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="person" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. User Account & Responsibilities</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account or password. We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in our sole discretion.
                        </Text>
                    </View>

                    {/* Ordering and Payments */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. Ordering and Payments</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            All payments must be made at the time of placing the order. We accept various forms of payment as indicated on the app. Prices for our products are subject to change without notice. We strive to provide accurate product and pricing information, but pricing or typographical errors may occur.
                        </Text>
                    </View>

                    {/* Delivery Policy */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. Delivery Policy</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            We will make every effort to deliver your order within the estimated delivery time. However, we are not liable for any delays that are outside of our control. Risk of loss and title for items purchased from MintaFresh pass to you upon our delivery to the carrier.
                        </Text>
                    </View>

                    {/* Cancellations and Refunds */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="undo" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. Cancellations and Refunds</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Our policy on cancellations and refunds is detailed within the app. Please review it carefully before placing an order. Generally, orders cannot be cancelled once they have been dispatched. Refunds will be processed according to our refund policy, available in the app's help section.
                        </Text>
                    </View>

                    {/* Limitation of Liability */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="gavel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            MintaFresh will not be liable for any indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, the service or products. Our liability is limited to the maximum extent permitted by law.
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
});

export default TermsAndConditions;