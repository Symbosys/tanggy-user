import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/type';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';

const { width } = Dimensions.get('window');

/**
 * FloatingEliteMembership - Persistent floating button (Always Dark/Gold Luxury)
 */
export const FloatingEliteMembership = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Animation Refs
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous Shimmer Ray
        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 2,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        const rotate = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const float = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -5,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        shimmer.start();
        pulse.start();
        rotate.start();
        float.start();

        return () => {
            shimmer.stop();
            pulse.stop();
            rotate.stop();
            float.stop();
        };
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [-1, 2],
        outputRange: [-width, width],
    });

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.outerContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('EliteMembership')}
                style={styles.touchable}
            >
                <View style={styles.cardWrapper}>
                    <Animated.View style={[styles.rotatingGlow, { transform: [{ rotate: rotation }] }]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255, 215, 0, 0.1)', 'transparent']}
                            style={{ flex: 1, borderRadius: 100 }}
                        />
                    </Animated.View>

                    <LinearGradient
                        colors={['#050505', '#1a1a1a', '#050505']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.mainGradient}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerRay,
                                { transform: [{ translateX: shimmerTranslate }, { rotate: '25deg' }] }
                            ]}
                        />

                        <View style={styles.content}>
                            <Animated.View style={[styles.iconWrapper, { transform: [{ translateY: floatAnim }] }]}>
                                <View style={styles.lottieWrapper}>
                                    <LottieView
                                        source={require('../../assets/lottie/elite_membership.json')}
                                        autoPlay
                                        loop
                                        style={styles.lottieIcon}
                                    />
                                </View>
                            </Animated.View>

                            <View style={styles.textContainer}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.title}>ELITE PASS</Text>
                                    <View style={styles.premiumBadge}>
                                        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                                    </View>
                                </View>
                                <Text style={styles.subtitle}>Unlock VIP Privileges & Rewards</Text>

                                <View style={styles.benefitRow}>
                                    <Icon name="check-circle" size={10} color="#FFD700" />
                                    <Text style={styles.benefitMiniText}>Free Express Delivery</Text>
                                    <View style={styles.separator} />
                                    <Icon name="check-circle" size={10} color="#FFD700" />
                                    <Text style={styles.benefitMiniText}>Extra 10% Off</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <LinearGradient
                                colors={['#FFD700', '#FDB931', '#FFD700']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.joinButton}
                            >
                                <Text style={styles.joinButtonText}>JOIN</Text>
                                <Icon name="chevron-right" size={12} color="#000" />
                            </LinearGradient>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * EliteMemberShipCard - Promotional card for Home screen (Uses App Theme Colors)
 */
export const EliteMemberShipCard = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { isAuthenticated } = useAuth();

    // Animation Refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(25)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 900,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.promoCardRoot,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            <LinearGradient
                colors={['#FFFFFF', '#FDF4FF']}
                style={styles.promoCardMain}
            >
                {/* Visual Accent */}
                <View style={styles.cardVisualAccent}>
                    <LinearGradient
                        colors={[COLORS.primary + '20', COLORS.accent + '10']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                <View style={styles.cardHeaderRow}>
                    <View style={styles.lottieContainer}>
                        <LottieView
                            source={require('../../assets/lottie/elite_membership.json')}
                            autoPlay
                            loop
                            style={styles.cardLottieStyle}
                        />
                    </View>
                    <View style={styles.headerTextGroup}>
                        <Text style={[styles.cardTag, { color: COLORS.primary }]}>MINTA PRESTIGE</Text>
                        <Text style={styles.cardHeading}>Become an Elite Member</Text>
                    </View>
                </View>

                <View style={styles.perksContainer}>
                    <View style={styles.perk}>
                        <View style={[styles.perkIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Icon name="truck-fast-outline" size={16} color={COLORS.primary} />
                        </View>
                        <Text style={styles.perkText}>Free Delivery</Text>
                    </View>
                    <View style={styles.perk}>
                        <View style={[styles.perkIcon, { backgroundColor: COLORS.accent + '20' }]}>
                            <Icon name="ticket-percent-outline" size={16} color={COLORS.primary} />
                        </View>
                        <Text style={styles.perkText}>Promo Access</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {!isAuthenticated ? (
                        <View style={styles.guestFooter}>
                            <View>
                                <Text style={styles.guestPromo}>Try 1 Month FREE</Text>
                                <Text style={styles.guestSub}>Limited time invitation</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login' as any)}
                                style={styles.actionBtn}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.accent]}
                                    style={styles.btnGradient}
                                >
                                    <Text style={styles.btnText}>LOGIN</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EliteMembership')}
                            style={styles.memberFooterAction}
                        >
                            <Text style={[styles.knowMoreLink, { color: COLORS.primary }]}>Upgrade your experience</Text>
                            <View style={[styles.circleArrow, { backgroundColor: COLORS.primary }]}>
                                <Icon name="arrow-right" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // Floating Styles (Always Dark/Gold)
    outerContainer: {
        position: 'absolute',
        bottom: 85,
        left: 20,
        right: 20,
        zIndex: 1000,
        elevation: 15,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    touchable: {
        borderRadius: 30,
    },
    cardWrapper: {
        borderTopLeftRadius: 40,
        borderBottomRightRadius: 40,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 215, 0, 0.5)',
        backgroundColor: '#000',
    },
    rotatingGlow: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        top: -width * 0.4,
        left: -width * 0.1,
        opacity: 0.4,
    },
    mainGradient: {
        padding: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shimmerRay: {
        position: 'absolute',
        top: -100,
        left: 0,
        width: 80,
        height: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        zIndex: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        zIndex: 2,
    },
    iconWrapper: {
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottieWrapper: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottieIcon: {
        width: 60,
        height: 60,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
    },
    title: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    premiumBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        marginLeft: 6,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    premiumBadgeText: {
        color: '#FFD700',
        fontSize: 7,
        fontWeight: '900',
    },
    subtitle: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '600',
        opacity: 0.85,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        opacity: 0.7,
    },
    benefitMiniText: {
        color: '#CCC',
        fontSize: 8,
        marginLeft: 3,
        fontWeight: '500',
    },
    separator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 5,
    },
    buttonContainer: {
        marginLeft: 6,
        zIndex: 2,
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    joinButtonText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
        marginRight: 2,
    },

    // Card Styles (Uses App Theme Colors)
    promoCardRoot: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    promoCardMain: {
        padding: 22,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardVisualAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '100%',
        borderBottomLeftRadius: 100,
        overflow: 'hidden',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lottieContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardLottieStyle: {
        width: 70,
        height: 70,
    },
    headerTextGroup: {
        marginLeft: 12,
        flex: 1,
    },
    cardTag: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    cardHeading: {
        fontSize: 18,
        color: '#222',
        fontWeight: '800',
        marginTop: 2,
    },
    perksContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    perk: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },
    perkIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    perkText: {
        fontSize: 12,
        color: '#555',
        fontWeight: '600',
        marginLeft: 8,
    },
    cardFooter: {
        marginTop: 25,
    },
    guestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guestPromo: {
        fontSize: 14,
        color: '#333',
        fontWeight: '800',
    },
    guestSub: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
        marginTop: 1,
    },
    actionBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 3,
    },
    btnGradient: {
        paddingVertical: 10,
        paddingHorizontal: 22,
    },
    btnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
    },
    memberFooterAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    knowMoreLink: {
        fontSize: 13,
        fontWeight: '700',
    },
    circleArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});