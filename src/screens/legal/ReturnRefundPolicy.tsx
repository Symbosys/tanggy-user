import { useRef, useState } from "react";
import {
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../theme/theme";
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

const RefundAndReturnPolicy = ({ navigation }: AppNavigation) => {
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
                        <Text style={styles.headerTitle}>REFUND AND RETURN POLICY</Text>
                        <View style={styles.headerButton} />
                    </View>
                </LinearGradient>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { top: headerHeight }]}>
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
                    <Text style={styles.lastUpdated}>Effective Date: 05/02/2026</Text>
                    <Text style={styles.subHeaderText}>
                        Minta Fresh is an online marketplace that facilitates the sale and delivery of fresh raw poultry,
                        meat, and fish products. By placing an order through the Minta Fresh mobile application, you agree
                        to this Delivery, Cancellation, and Refund Policy.
                    </Text>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>

                    {/* 1. DELIVERY POLICY */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="local_shipping" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>1. DELIVERY POLICY</Text>
                        </View>
                        <Text style={[styles.sectionText, { fontWeight: 'bold' }]}>1.1 Order Processing & Delivery Time</Text>
                        <Text style={styles.sectionText}>• Orders are generally processed within 60 minutes of confirmation.</Text>
                        <Text style={styles.sectionText}>• Delivery is typically completed within 60 minutes after dispatch, subject to location, traffic, weather conditions, and operational factors.</Text>
                        <Text style={styles.sectionText}>• Delivery timelines are estimates and may vary.</Text>

                        <Text style={[styles.sectionText, { fontWeight: 'bold', marginTop: 8 }]}>1.2 Delivery Charges</Text>
                        <Text style={styles.sectionText}>• Delivery fees (if applicable) are displayed clearly at checkout before payment confirmation.</Text>
                        <Text style={styles.sectionText}>• Charges may vary depending on distance, order value, or promotional offers.</Text>

                        <Text style={[styles.sectionText, { fontWeight: 'bold', marginTop: 8 }]}>1.3 Order Tracking</Text>
                        <Text style={styles.sectionText}>Customers can track order status in real-time within the Minta Fresh app.</Text>
                    </View>

                    {/* 2. NATURE OF PRODUCTS */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="info" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>2. NATURE OF PRODUCTS</Text>
                        </View>
                        <Text style={styles.sectionText}>
                            Minta Fresh supplies perishable food items (raw poultry, meat, and fish). Due to hygiene and food safety regulations:
                        </Text>
                        <Text style={styles.sectionText}>• Products are non-returnable once delivered.</Text>
                        <Text style={styles.sectionText}>• We do not offer product replacements.</Text>
                        <Text style={styles.sectionText}>• Refunds are provided only in eligible cases described below.</Text>
                        <Text style={styles.sectionText}>This policy complies with applicable food safety and consumer protection standards.</Text>
                    </View>

                    {/* 3. REFUND ELIGIBILITY */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="check_circle" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>3. REFUND ELIGIBILITY</Text>
                        </View>
                        <Text style={styles.sectionText}>Refunds may be issued in the following circumstances, subject to verification:</Text>
                        <Text style={styles.sectionText}>1. Product delivered in damaged condition.</Text>
                        <Text style={styles.sectionText}>2. Product appears spoiled at the time of delivery.</Text>
                        <Text style={styles.sectionText}>3. Wrong product delivered.</Text>
                        <Text style={styles.sectionText}>4. Item(s) missing from the order.</Text>
                        <Text style={styles.sectionText}>5. Order marked as delivered but not received.</Text>
                        <Text style={styles.sectionText}>All refund claims are subject to review and approval by Minta Fresh.</Text>
                    </View>

                    {/* 4. TIME LIMIT FOR REPORTING ISSUES */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="timer" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>4. TIME LIMIT FOR REPORTING ISSUES</Text>
                        </View>
                        <Text style={styles.sectionText}>• Customers must report delivery-related issues within 30 minutes of delivery confirmation.</Text>
                        <Text style={styles.sectionText}>• Reports can be submitted through in-app support or customer service.</Text>
                        <Text style={styles.sectionText}>• Claims submitted beyond this timeframe may not be eligible due to the perishable nature of food products.</Text>
                    </View>

                    {/* 5. REQUIRED PROOF */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="verified" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>5. REQUIRED PROOF</Text>
                        </View>
                        <Text style={styles.sectionText}>To process a refund request, customers may be required to provide:</Text>
                        <Text style={styles.sectionText}>• Clear photos or video evidence</Text>
                        <Text style={styles.sectionText}>• Original packaging (if applicable)</Text>
                        <Text style={styles.sectionText}>• Order ID and relevant details</Text>
                        <Text style={styles.sectionText}>Insufficient or unverifiable claims may result in denial of refund.</Text>
                    </View>

                    {/* 6. REFUND PROCESSING */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="payment" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>6. REFUND PROCESSING</Text>
                        </View>
                        <Text style={styles.sectionText}>• Approved refunds are processed to the original payment method only.</Text>
                        <Text style={styles.sectionText}>• Refunds are typically credited within 5–10 business days, depending on the payment provider or bank.</Text>
                        <Text style={styles.sectionText}>• Minta Fresh does not provide cash refunds for online payments.</Text>
                    </View>

                    {/* 7. CANCELLATION POLICY */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="cancel" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>7. CANCELLATION POLICY</Text>
                        </View>
                        <Text style={[styles.sectionText, { fontWeight: 'bold' }]}>7.1 Cancellation Before Dispatch</Text>
                        <Text style={styles.sectionText}>• Orders may be cancelled within 30 minutes of placement, provided they have not been dispatched.</Text>
                        <Text style={styles.sectionText}>• Eligible cancellations will receive a full refund.</Text>

                        <Text style={[styles.sectionText, { fontWeight: 'bold', marginTop: 8 }]}>7.2 Cancellation After Dispatch</Text>
                        <Text style={styles.sectionText}>• Once an order is dispatched, cancellation may not be possible due to food safety and logistics constraints.</Text>
                        <Text style={styles.sectionText}>• In rare cases, cancellation approval remains at the discretion of Minta Fresh.</Text>
                    </View>

                    {/* 8. MISUSE & FRAUD PREVENTION */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="security" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>8. MISUSE & FRAUD PREVENTION</Text>
                        </View>
                        <Text style={styles.sectionText}>Minta Fresh reserves the right to:</Text>
                        <Text style={styles.sectionText}>• Reject refund requests that are fraudulent or abusive.</Text>
                        <Text style={styles.sectionText}>• Limit or suspend accounts involved in repeated false claims.</Text>
                        <Text style={styles.sectionText}>Actions will be taken in accordance with applicable consumer protection laws.</Text>
                    </View>

                    {/* 9. CUSTOMER SUPPORT */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="contact_support" size={20} color={ACCENT_COLOR} />
                            <Text style={styles.sectionTitle}>9. CUSTOMER SUPPORT</Text>
                        </View>
                        <Text style={styles.sectionText}>For assistance, customers may contact:</Text>
                        <Text style={styles.sectionText}>Email: support@mintafresh.com</Text>
                        <Text style={styles.sectionText}>In-App Support: Available within the Minta Fresh App</Text>
                    </View>

                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 },
    headerGradient: { paddingBottom: 16, paddingHorizontal: 16, elevation: 5 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.white, flex: 1, textAlign: "center" },
    progressBar: { position: "absolute", left: 0, right: 0, height: 4, backgroundColor: WHITE_30, zIndex: 10 },
    progressFill: { height: "100%" },
    main: { flex: 1 },
    mainContent: { paddingHorizontal: 16, paddingBottom: 32 },
    subHeader: { paddingVertical: 24, alignItems: "center" },
    subHeaderText: { fontSize: 16, color: BODY_TEXT_80, textAlign: "center", fontWeight: '600' },
    lastUpdated: { fontSize: 14, color: BODY_TEXT_60, marginTop: 8 },
    contentCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, elevation: 5, gap: 24 },
    section: { gap: 8 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR },
    sectionText: { fontSize: 15, color: BODY_TEXT, lineHeight: 24 },
});

export default RefundAndReturnPolicy;