import React, { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';
import { useCartStore } from '../../store/cart';

interface FloatingCartProps {
    totalItems: number;
    subTotal: number;
    onPress: () => void;
    hasBottomTab?: boolean;
}

const BUTTON_GRADIENT = ['#6A0DAD', '#D8B4FF'];
// Match exact bottom tab height from Bottom.tsx
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;
const SLIDE_DISTANCE = 80; // Slide distance to reveal Remove text

export default function FloatingCart({
    totalItems,
    subTotal,
    onPress,
    hasBottomTab = false
}: FloatingCartProps) {
    const insets = useSafeAreaInsets();
    const clearCart = useCartStore((state) => state.clearCart);
    const [isSlid, setIsSlid] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const bottomPosition = hasBottomTab
        ? BOTTOM_TAB_HEIGHT - 60 // Above tab bar with very small gap
        : Math.max(insets.bottom, 12) + 8; // Above safe area with small gap

    // Toggle slide animation
    const handleToggleSlide = () => {
        if (isSlid) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 50,
            }).start(() => setIsSlid(false));
        } else {
            setIsSlid(true);
            Animated.spring(slideAnim, {
                toValue: -SLIDE_DISTANCE,
                useNativeDriver: true,
                friction: 8,
                tension: 50,
            }).start();
        }
    };

    // Clear cart and reset
    const handleRemoveCart = async () => {
        await clearCart();
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 50,
        }).start(() => setIsSlid(false));
    };

    return (
        <View style={[styles.container, { bottom: bottomPosition }]}>
            {/* Remove Text - Only visible when slid */}
            {isSlid && (
                <TouchableOpacity
                    style={styles.removeContainer}
                    onPress={handleRemoveCart}
                    activeOpacity={0.7}
                >
                    <Text style={styles.removeText}>
                        <Icon name="delete" size={16} color={COLORS.white} style={styles.removeText} />
                    </Text>
                </TouchableOpacity>
            )}

            {/* Sliding Cart Bar - ORIGINAL DESIGN */}
            <Animated.View style={[styles.slidingContainer, { transform: [{ translateX: slideAnim }] }]}>
                <LinearGradient
                    colors={['#000000', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.viewCartBar}
                >
                    <View style={styles.cartInfo}>
                        <Text style={styles.viewCartItems}>
                            {totalItems} {totalItems > 1 ? 'Items' : 'Item'} | ₹{parseToDecimal(subTotal).toFixed(2)}
                        </Text>
                        <Text style={styles.viewCartNote}>Extra charges may apply</Text>
                    </View>
                    <TouchableOpacity onPress={onPress}>
                        <LinearGradient
                            colors={BUTTON_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.viewCartButton}
                        >
                            <Text style={styles.viewCartText}>View Cart</Text>
                            <Icon name="arrow-forward" size={20} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* X Button on the RIGHT side */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleToggleSlide}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="close" size={18} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 70,
    },
    removeContainer: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: COLORS.primary,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    removeText: {
        color: COLORS.white,
        fontSize: 25,
        fontWeight: 'bold',
    },
    slidingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
    },
    viewCartBar: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cartInfo: {
        flex: 1,
    },
    viewCartItems: { color: COLORS.white, fontWeight: '700' },
    viewCartNote: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
    viewCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 40,
    },
    viewCartText: { color: COLORS.white, fontWeight: '700', marginRight: 6 },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
