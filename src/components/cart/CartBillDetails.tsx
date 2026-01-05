import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartCalculations } from './hooks';
import { useCartUIStore } from './store';

export const CartBillDetails: React.FC = () => {
    const {
        itemTotal,
        deliveryFee,
        platformFee,
        packingFee,
        totalGstAmount,
        tipAmount,
        discountAmount,
        total,
        // Deconstruct individual tax components if needed to pass to popup, 
        // or pass the entire hook result if we refactor popup props.
        // For now, let's just pass what the popup needs.
        gstOnItemTotal,
        gstOnDeliveryFee,
        gstOnPlatform,
        gstOnPackingFee,
    } = useCartCalculations();

    const { setShowTaxPopup } = useCartUIStore();

    return (
        <View style={styles.subtotalSection}>
            <View style={styles.subtotalCard}>
                {/* Item Total */}
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Item Total</Text>
                    <Text style={styles.subtotalValue}>₹{itemTotal.toFixed(2)}</Text>
                </View>

                {/* Delivery Fee */}
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Delivery Fee</Text>
                    <Text style={styles.subtotalValue}>₹{deliveryFee.toFixed(2)}</Text>
                </View>

                {/* Platform Fee */}
                {platformFee > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Platform Fee</Text>
                        <Text style={styles.subtotalValue}>₹{platformFee.toFixed(2)}</Text>
                    </View>
                )}

                {/* Packing Fee */}
                {packingFee > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Packing Fee</Text>
                        <Text style={styles.subtotalValue}>₹{packingFee.toFixed(2)}</Text>
                    </View>
                )}

                {/* Taxes */}
                <TouchableOpacity
                    style={styles.subtotalRow}
                    onPress={() => setShowTaxPopup(true)}
                    activeOpacity={0.7}
                >
                    <View style={styles.taxLabelContainer}>
                        <Text style={[styles.subtotalLabel, { color: COLORS.primary, textDecorationLine: 'underline' }]}>
                            Taxes & GST
                        </Text>
                        <MaterialIcons name="info-outline" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={styles.subtotalValue}>₹{totalGstAmount.toFixed(2)}</Text>
                </TouchableOpacity>

                {/* Tip */}
                {tipAmount > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Tip</Text>
                        <Text style={styles.subtotalValue}>₹{tipAmount.toFixed(2)}</Text>
                    </View>
                )}

                {/* Discount (if any) */}
                {discountAmount > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={[styles.subtotalLabel, { color: COLORS.success }]}>Discount</Text>
                        <Text style={[styles.subtotalValue, { color: COLORS.success }]}>- ₹{discountAmount.toFixed(2)}</Text>
                    </View>
                )}

                <View style={styles.dashedBorder} />

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>To Pay</Text>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        style={styles.gradientTextContainer}
                    >
                        <Text style={styles.gradientText}>₹{total.toFixed(2)}</Text>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
};
