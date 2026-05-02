import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/theme';


interface BottomCartPopupProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    price: number;
    loading?: boolean;
}

const BottomCartPopup: React.FC<BottomCartPopupProps> = ({ visible, onClose, onConfirm, price, loading }) => {
    const [timeLeft, setTimeLeft] = useState(3);
    const progress = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation logic
    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease),
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [visible, pulseAnim]);

    useEffect(() => {
        if (visible) {
            setTimeLeft(2);
            progress.setValue(0);

            // Start the countdown
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onConfirm(); // Trigger confirm when timer hits 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Animate progress bar (10 seconds) - from 1 to 0 (full to empty) is better visual for countdown
            // Or 0 to 1 if we are filling it. Previous code did shrink.
            // Let's make it shrink: widthInterpolated maps 0->100% and 1->0%.
            Animated.timing(progress, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();

            return () => {
                clearInterval(timer);
                progress.stopAnimation();
            };
        }
    }, [visible, onConfirm, progress]);

    if (!visible) return null;

    const widthInterpolated = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['100%', '0%'], // Progress bar shrinks as time passes
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Close modal on outside touch */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.popupContainer}>
                    {/* Decorative Handle */}
                    <View style={styles.handleIndicator} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconWrapper}>
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <MaterialCommunityIcons name="rocket-launch" size={28} color={COLORS.white} />
                            )}
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>{loading ? 'Placing Order...' : 'Confirming Order...'}</Text>
                            <Text style={styles.message}>{loading ? 'Please wait while we process your order.' : 'Almost there! Just a few seconds.'}</Text>
                        </View>
                    </View>

                    {/* Timer Circle */}
                    <View style={styles.timerWrapper}>
                        <Animated.View style={[styles.timerCircleBackground, { transform: [{ scale: pulseAnim }] }]}>
                            <LinearGradient
                                colors={['rgba(135, 25, 198, 0.2)', 'rgba(135, 25, 198, 0.05)']}
                                style={styles.timerGradientBg}
                            />
                        </Animated.View>
                        <View style={styles.timerInnerCircle}>
                            <Text style={styles.timerText}>{timeLeft}</Text>
                            <Text style={styles.timerLabel}>seconds</Text>
                        </View>
                    </View>

                    {/* Price & Progress */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.priceLabel}>Total Amount</Text>
                        <Text style={styles.priceText}>₹{price.toFixed(2)}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <Animated.View style={[styles.progressBarFill, { width: widthInterpolated }]}>
                                <LinearGradient
                                    colors={[COLORS.primary, '#b58ff0']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1 }}
                                />
                            </Animated.View>
                        </View>
                        <Text style={styles.autoConfirmText}>Auto-confirming in {timeLeft}s</Text>
                    </View>

                    {/* Cancel Action */}
                    {!loading && (
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
                            <View style={styles.cancelButtonContent}>
                                <MaterialIcons name="close" size={20} color="#EF4444" />
                                <Text style={styles.cancelButtonText}>Cancel Order</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker overlay
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    popupContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    handleIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 20,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timerWrapper: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    timerCircleBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 70,
        overflow: 'hidden',
    },
    timerGradientBg: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    timerInnerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    timerText: {
        fontSize: 42,
        fontWeight: '900',
        color: COLORS.primary,
        lineHeight: 48,
    },
    timerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    detailsContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    priceLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    priceText: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: 24,
    },
    progressBarBackground: {
        width: '100%',
        height: 10,
        backgroundColor: '#F3F4F6', // Lighter grey
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
        overflow: 'hidden',
    },
    autoConfirmText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        fontStyle: 'italic',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#FEF2F2', // Very light red
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    cancelButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444', // Red 500
    },
});

export default BottomCartPopup;
