import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartUIStore } from './store';

export const CartTipSection: React.FC = () => {
    const { selectedTip, toggleTip } = useCartUIStore();

    const handleTipSelect = (tip: number) => {
        toggleTip(tip);
    };

    return (
        <View style={styles.tipSection}>
            <LinearGradient
                colors={[`${COLORS.secondary}20`, COLORS.white]}
                style={styles.tipCard}
            >
                <Text style={styles.tipTitle}>Tip your delivery partner</Text>
                <Text style={styles.tipDesc}>100% of the tip goes to your delivery partner.</Text>
                <View style={styles.tipButtons}>
                    {[10, 20, 30, 40, 50].map((tip) => (
                        <TouchableOpacity
                            key={tip}
                            style={[
                                styles.tipButtonUnselected,
                                selectedTip === tip && styles.tipButtonSelected,
                            ]}
                            onPress={() => handleTipSelect(tip)}
                        >
                            <Text style={[styles.tipButtonText, selectedTip === tip && styles.tipButtonSelectedText]}>
                                ₹{tip}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>
        </View>
    );
};
