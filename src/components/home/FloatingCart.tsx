import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';

interface FloatingCartProps {
    totalItems: number;
    subTotal: number;
    onPress: () => void;
    hasBottomTab?: boolean; // Whether there's a bottom tab bar below
}

const BUTTON_GRADIENT = ['#6A0DAD', '#D8B4FF'];
// Match exact bottom tab height from Bottom.tsx
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

export default function FloatingCart({
    totalItems,
    subTotal,
    onPress,
    hasBottomTab = false
}: FloatingCartProps) {
    const insets = useSafeAreaInsets();

    // Calculate bottom position based on whether there's a tab bar
    const bottomPosition = hasBottomTab
        ? BOTTOM_TAB_HEIGHT + 10 // Above tab bar with small gap
        : Math.max(insets.bottom, 12) + 8; // Above safe area with small gap

    return (
        <LinearGradient
            colors={['#000000', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.viewCartBar, { bottom: bottomPosition }]}
        >
            <View>
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    viewCartBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
});
