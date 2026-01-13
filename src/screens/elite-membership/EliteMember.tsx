import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEliteMembership } from '../../api/hooks/elite_membership';
import { useAuth } from '../../context/AuthContext';


const { width, height } = Dimensions.get('window');

const BenefitCard = ({ icon, title, subtitle, index }: { icon: string; title: string; subtitle: string; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            delay: 400 + (index * 150),
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.benefitCard, {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }]}>
            <LinearGradient
                colors={['rgba(255, 215, 0, 0.12)', 'rgba(255, 215, 0, 0.02)']}
                style={styles.benefitIconWrapper}
            >
                <MaterialCommunityIcons name={icon} size={28} color="#FFD700" />
            </LinearGradient>
            <View style={styles.benefitTextContent}>
                <Text style={styles.benefitTitleText}>{title}</Text>
                <Text style={styles.benefitSubtitleText}>{subtitle}</Text>
            </View>
        </Animated.View>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [expanded, setExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const animatedController = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.timing(animatedController, {
            toValue,
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false,
        }).start();
    };

    const heightInterpolate = animatedController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, contentHeight > 0 ? contentHeight + 20 : 100],
    });

    return (
        <View style={[styles.faqCard, expanded && styles.faqCardExpanded]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggle}
                style={styles.faqHeader}
            >
                <Text style={styles.faqQuestion}>{question}</Text>
                <View style={[styles.faqIconCircle, expanded && styles.faqIconCircleActive]}>
                    <MaterialCommunityIcons
                        name={expanded ? "minus" : "plus"}
                        size={18}
                        color={expanded ? "#000" : "#FFD700"}
                    />
                </View>
            </TouchableOpacity>
            <Animated.View style={{ height: heightInterpolate, overflow: 'hidden' }}>
                <View
                    style={styles.faqBody}
                    onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
                >
                    <Text style={styles.faqAnswer}>{answer}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const EliteMemberScreen = () => {
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();
    const scrollY = useRef(new Animated.Value(0)).current;

    const { data, isLoading } = useEliteMembership({ enabled: isAuthenticated });

    // Extract membership data
    const membership = data?.data;
    const plan = membership?.plan;
    const isActive = membership?.status === 'ACTIVE';
    const isTrial = membership?.isTrial;

    // Format dates
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!membership?.endDate) return 0;
        const endDate = new Date(membership.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    // Get status text
    const getStatusText = () => {
        if (!membership) return 'NOT ACTIVE';
        if (isActive && isTrial) return 'FREE TRIAL';
        if (isActive) return 'ACTIVE PASS';
        return membership.status || 'INACTIVE';
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor="#050505" />
                <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <LottieView
                        source={require('../../assets/lottie/elite_membership.json')}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                    />
                    <Text style={{ color: '#FFD700', marginTop: 20, fontSize: 14, fontWeight: '600' }}>
                        Loading membership...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            <View style={styles.mainContainer}>
                {/* Global Background Elements */}
                <View style={[styles.glowOrb, { top: height * 0.1, left: -100, backgroundColor: 'rgba(255, 215, 0, 0.06)' }]} />
                <View style={[styles.glowOrb, { bottom: height * 0.2, right: -100, backgroundColor: 'rgba(146, 53, 208, 0.04)' }]} />

                <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Cinematic Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerLabelContainer}>
                            <Text style={styles.headerLabel}>ELITE MEMBERSHIP</Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Subscription Pass Visual */}
                    <View style={styles.passWrapper}>
                        <LinearGradient
                            colors={['#1a1a1b', '#0a0a0b', '#1a1a1b']}
                            style={styles.premiumPass}
                        >
                            {/* Decorative Shimmer Line */}
                            <View style={styles.passShimmer} />

                            <View style={styles.passHeader}>
                                <View style={styles.passLogoBox}>
                                    <LottieView
                                        source={require('../../assets/lottie/elite_membership.json')}
                                        autoPlay
                                        loop
                                        style={styles.passLottie}
                                    />
                                </View>
                                <View style={[styles.statusBadge, isActive && { backgroundColor: 'rgba(0, 255, 0, 0.1)', borderColor: 'rgba(0, 255, 0, 0.2)' }]}>
                                    <View style={[styles.pulseDot, isActive && { backgroundColor: '#00FF00' }]} />
                                    <Text style={[styles.statusText, isActive && { color: '#00FF00' }]}>
                                        {getStatusText()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.passBody}>
                                <Text style={styles.passTitle}>
                                    {plan?.name?.toUpperCase() || 'THE ELITE EXPERIENCE'}
                                </Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.currency}>₹</Text>
                                    <Text style={styles.priceValue}>
                                        {isTrial ? '0' : '1'}
                                    </Text>
                                    <View style={styles.priceDetail}>
                                        <Text style={styles.pricePeriod}>/month</Text>
                                        {!isTrial && <Text style={styles.priceOld}>₹999</Text>}
                                    </View>
                                </View>

                                {isTrial && (
                                    <View style={styles.promoBanner}>
                                        <MaterialCommunityIcons name="gift-outline" size={16} color="#FFD700" />
                                        <Text style={styles.promoText}>Free Trial Active!</Text>
                                    </View>
                                )}

                                {!isAuthenticated && (
                                    <View style={styles.promoBanner}>
                                        <MaterialCommunityIcons name="gift-outline" size={16} color="#FFD700" />
                                        <Text style={styles.promoText}>Login for 1 Month FREE Access</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.passFooter}>
                                <View style={styles.passDashedLine} />
                                <View style={styles.passDetailsRow}>
                                    <View>
                                        <Text style={styles.detailLabel}>MEMBER TYPE</Text>
                                        <Text style={styles.detailValue}>
                                            {isTrial ? 'FREE TRIAL' : 'PREMIUM ELITE'}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.detailLabel}>
                                            {isActive ? 'DAYS LEFT' : 'VALIDITY'}
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {isActive ? `${getDaysRemaining()} DAYS` : `${plan?.durationDays || 30} DAYS`}
                                        </Text>
                                    </View>
                                </View>
                                {isActive && membership?.endDate && (
                                    <View style={[styles.passDetailsRow, { marginTop: 12 }]}>
                                        <View>
                                            <Text style={styles.detailLabel}>STARTED ON</Text>
                                            <Text style={styles.detailValue}>{formatDate(membership.startDate)}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.detailLabel}>EXPIRES ON</Text>
                                            <Text style={styles.detailValue}>{formatDate(membership.endDate)}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Ticket Notch Effects */}
                            <View style={styles.notchLeft} />
                            <View style={styles.notchRight} />
                        </LinearGradient>
                    </View>

                    {/* Benefits Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Elite Privileges</Text>
                            <View style={styles.titleUnderline} />
                        </View>

                        {plan?.benefits?.freeDelivery && (
                            <BenefitCard
                                index={0}
                                icon="truck-delivery"
                                title="Unlimited Free Delivery"
                                subtitle="Zero delivery charges on every single order you place."
                            />
                        )}
                        <BenefitCard
                            index={1}
                            icon="brightness-percent"
                            title="Extra 10% Flat Discount"
                            subtitle="Automatic extra savings on top of all existing offers."
                        />
                        <BenefitCard
                            index={2}
                            icon="clock-fast"
                            title="VIP Delivery Slots"
                            subtitle="Your orders get prioritized for the fastest delivery."
                        />
                        {plan?.benefits?.prioritySupport && (
                            <BenefitCard
                                index={3}
                                icon="headset"
                                title="Priority Support"
                                subtitle="Dedicated 24/7 priority support for elite members."
                            />
                        )}
                    </View>

                    {/* FAQ Section */}
                    <View style={[styles.section, { marginBottom: 140 }]}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Frequently Asked</Text>
                            <View style={styles.titleUnderline} />
                        </View>

                        <FAQItem
                            question="How do I get my 1st month free?"
                            answer="Simply login or sign up for a new account. New members are automatically eligible for their first 30 days of Elite membership at no cost."
                        />
                        <FAQItem
                            question="What happens after the first month?"
                            answer="After your free trial (if applicable), your membership will continue at just ₹1 per month. You can manage this in your profile settings."
                        />
                        <FAQItem
                            question="Are there any hidden charges?"
                            answer="Absolutely not. The ₹1 fee is all-inclusive, and there are no extra service charges or hidden fees for Elite members."
                        />
                        <FAQItem
                            question="Can I cancel the membership?"
                            answer="Yes, you can cancel your Elite subscription at any time with a single tap from your 'Membership' settings page."
                        />
                    </View>
                </Animated.ScrollView>

                {/* Fixed Action Bar */}
                <View style={styles.bottomBar}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.03)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.priceInfo}>
                        <Text style={styles.ctaPriceLabel}>
                            {isActive ? 'YOUR MEMBERSHIP' : isAuthenticated ? 'MEMBERSHIP FEE' : 'SPECIAL OFFER'}
                        </Text>
                        <View style={styles.ctaPriceRow}>
                            {isActive ? (
                                <Text style={[styles.ctaPriceValue, { color: '#00FF00', fontSize: 18 }]}>
                                    {getDaysRemaining()} days left
                                </Text>
                            ) : (
                                <>
                                    <Text style={styles.ctaPriceCurrency}>₹</Text>
                                    <Text style={styles.ctaPriceValue}>{isAuthenticated ? '1' : '0'}</Text>
                                    <Text style={styles.ctaPriceUnit}>/mo</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.buyButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            if (!isAuthenticated) {
                                navigation.navigate('Login');
                            } else if (isActive) {
                                navigation.navigate('BottomTab');
                            }
                        }}
                    >
                        <LinearGradient
                            colors={isActive ? ['#00FF00', '#00AA00'] : ['#FFD700', '#B8860B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buyGradient}
                        >
                            <Text style={styles.buyBtnText}>
                                {!isAuthenticated ? 'LOGIN FOR FREE' : isActive ? 'START SHOPPING' : 'GET ELITE NOW'}
                            </Text>
                            <MaterialCommunityIcons
                                name={isActive ? "shopping" : "lightning-bolt"}
                                size={20}
                                color="#000"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#050505',
    },
    mainContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    glowOrb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.5,
        zIndex: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        zIndex: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLabelContainer: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
    },
    headerLabel: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    passWrapper: {
        paddingHorizontal: 20,
        marginTop: 15,
        alignItems: 'center',
    },
    premiumPass: {
        width: width - 40,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.25)',
        padding: 24,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#FFD700',
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    passShimmer: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 100,
        height: 500,
        backgroundColor: 'rgba(255,255,255,0.03)',
        transform: [{ rotate: '25deg' }],
    },
    passHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    passLogoBox: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15,
    },
    passLottie: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFD700',
        marginRight: 6,
    },
    statusText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    passBody: {
        alignItems: 'center',
        marginVertical: 10,
    },
    passTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 3,
        opacity: 0.6,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 10,
    },
    currency: {
        fontSize: 36,
        color: '#FFD700',
        fontWeight: '900',
        marginRight: 2,
    },
    priceValue: {
        fontSize: 90,
        color: '#FFF',
        fontWeight: '900',
        lineHeight: 100,
    },
    priceDetail: {
        marginLeft: 8,
    },
    pricePeriod: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '500',
        opacity: 0.4,
    },
    priceOld: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: '700',
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginTop: 15,
    },
    promoText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 6,
    },
    passFooter: {
        marginTop: 15,
    },
    passDashedLine: {
        height: 1,
        width: '110%',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        borderStyle: 'dashed',
        alignSelf: 'center',
        marginBottom: 20,
    },
    passDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 9,
        color: '#555',
        fontWeight: '900',
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '800',
        marginTop: 2,
    },
    notchLeft: {
        position: 'absolute',
        top: '73%',
        left: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#050505',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.25)',
    },
    notchRight: {
        position: 'absolute',
        top: '73%',
        right: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#050505',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.25)',
    },
    section: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    sectionHeaderRow: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    titleUnderline: {
        width: 40,
        height: 4,
        backgroundColor: '#FFD700',
        marginTop: 6,
        borderRadius: 2,
    },
    benefitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 22,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    benefitIconWrapper: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    benefitTextContent: {
        flex: 1,
    },
    benefitTitleText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    benefitSubtitleText: {
        color: '#808080',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    faqCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        overflow: 'hidden',
    },
    faqCardExpanded: {
        borderColor: 'rgba(255, 215, 0, 0.15)',
        backgroundColor: 'rgba(255, 215, 0, 0.02)',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    faqQuestion: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        paddingRight: 15,
    },
    faqIconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    faqIconCircleActive: {
        backgroundColor: '#FFD700',
        borderColor: '#FFD700',
    },
    faqBody: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    faqAnswer: {
        color: '#A0A0A0',
        fontSize: 13,
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: height > 800 ? 120 : 100,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: height > 800 ? 30 : 15,
    },
    priceInfo: {
        flex: 1,
    },
    ctaPriceLabel: {
        color: '#555',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    ctaPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 2,
    },
    ctaPriceCurrency: {
        fontSize: 16,
        color: '#FFD700',
        fontWeight: '800',
    },
    ctaPriceValue: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: '900',
        marginHorizontal: 2,
    },
    ctaPriceUnit: {
        fontSize: 14,
        color: '#555',
        fontWeight: '700',
    },
    buyButton: {
        flex: 1.4,
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
    },
    buyGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        marginRight: 6,
    },
});

export default EliteMemberScreen;
