import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartCalculations } from './hooks';

export const CartBillDetails: React.FC = () => {
    const {
        itemTotal,
        deliveryFee,
        platformFee,
        gstOnPlatform,
        packingFee,
        surcharge,
        tipAmount,
        discountAmount,
        total,
        walletDeduction,
        payableTotal,
    } = useCartCalculations();

    return (
        <View style={styles.subtotalSection}>
            <View style={styles.subtotalCard}>
                {/* Item Total */}
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Item Total</Text>
                    <Text style={styles.subtotalValue}>₹{itemTotal.toFixed(2)}</Text>
                </View>

                {/* Delivery Fee */}
                {deliveryFee > 0 && (
                    <View style={[styles.subtotalRow, { alignItems: 'flex-start' }]}>
                        <View>
                            <Text style={styles.subtotalLabel}>Delivery Fee</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.subtotalValue}>₹{deliveryFee.toFixed(2)}</Text>
                        </View>
                    </View>
                )}

                {/* Platform Fee */}
                {platformFee > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Platform Fee</Text>
                        <Text style={styles.subtotalValue}>₹{platformFee.toFixed(2)}</Text>
                    </View>
                )}

                {/* GST (18% on Platform Fee) */}
                {gstOnPlatform > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>GST (18% on Platform Fee)</Text>
                        <Text style={styles.subtotalValue}>₹{gstOnPlatform.toFixed(2)}</Text>
                    </View>
                )}

                {/* Packing Fee */}
                {packingFee > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Packing Fee</Text>
                        <Text style={styles.subtotalValue}>₹{packingFee.toFixed(2)}</Text>
                    </View>
                )}

                {/* Surge Charge */}
                {surcharge > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Surge Charge</Text>
                        <Text style={styles.subtotalValue}>₹{surcharge.toFixed(2)}</Text>
                    </View>
                )}

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

                {/* Wallet Applied */}
                {walletDeduction > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={[styles.subtotalLabel, { color: COLORS.success, fontWeight: '600' }]}>
                            Wallet Balance Applied
                        </Text>
                        <Text style={[styles.subtotalValue, { color: COLORS.success, fontWeight: '600' }]}>
                            - ₹{walletDeduction.toFixed(2)}
                        </Text>
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
                        <Text style={styles.gradientText}>₹{payableTotal.toFixed(2)}</Text>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
};
