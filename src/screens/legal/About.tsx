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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS } from "../../theme/theme";
import { AppNavigation } from "../../types/type";

const { width: screenWidth } = Dimensions.get("window");

const GRADIENT_PAGE = [COLORS.secondary, COLORS.white];
const GRADIENT_HEADER = [COLORS.primary, COLORS.accent];
const GRADIENT_PROGRESS = [COLORS.primary, COLORS.accent];

const PRIMARY_COLOR = COLORS.primary;
const ACCENT_COLOR = COLORS.accent;
const BODY_TEXT = COLORS.textSecondary;
const WHITE_30 = "rgba(255, 255, 255, 0.3)";
const BODY_TEXT_80 = "rgba(74, 74, 74, 0.8)";
const BODY_TEXT_60 = "rgba(74, 74, 74, 0.6)";

const AboutUs = ({ navigation }: AppNavigation) => {
    const [headerHeight, setHeaderHeight] = useState(72);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

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
                    style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>About Us</Text>
                        <View style={styles.headerButton} />
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
                style={[styles.main, { marginTop: headerHeight }]}
                contentContainerStyle={styles.mainContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Sub-header */}
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderText}>
                        Minta Club Private Limited (Brand: Minta Fresh)
                    </Text>
                    <Text style={styles.lastUpdated}>Last Updated: 05/02/2026</Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>About Minta Fresh</Text>
                        </View>

                        <Text style={styles.sectionText}>
                            Minta Fresh is a brand operated by Minta Club Private Limited, focused on providing convenient and reliable doorstep delivery of raw chicken, fish, and goat meat to customers.
                        </Text>

                        <Text style={styles.sectionText}>
                            We partner with verified local suppliers and processing units to ensure that all products are hygienically handled, carefully packed, and delivered as per food safety standards. Our platform enables customers to browse products, place orders, and receive fresh raw meat at their preferred location.
                        </Text>

                        <Text style={styles.sectionText}>
                            We operate an online food ordering and delivery platform.
                        </Text>

                        <Text style={styles.sectionText}>
                            Minta Fresh is a technology-enabled service that facilitates the sale and delivery of food products only. The platform does not provide financial services, gaming, betting, reward-based earnings, or investment products of any kind.
                        </Text>

                        <Text style={styles.sectionText}>
                            Payments for orders are processed securely through third-party payment gateways. Any in-app wallet, where applicable, is used solely for internal order adjustments or refunds and is not a withdrawable or interest-bearing product.
                        </Text>

                        <Text style={styles.sectionText}>
                            The app includes payment functionality for food orders only. Any wallet shown is used solely for internal order adjustments or refunds and is not withdrawable.
                        </Text>

                        <Text style={styles.sectionText}>
                            Payouts to partners are backend operational settlements and are not user-facing features.
                        </Text>

                        <Text style={styles.sectionText}>
                            Our mission is to simplify access to quality raw meat and seafood while maintaining transparency, hygiene, and compliance with applicable laws and platform policies.
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
        marginTop: 72,
    },
    mainContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
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
        fontWeight: "600",
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
    },
    section: {
        gap: 16,
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

export default AboutUs;