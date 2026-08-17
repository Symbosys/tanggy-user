import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartCalculations } from './hooks';

export const CartBillDetails: React.FC = () => {
    const {
        itemTotal,
        itemDiscountAmount,
        promoDiscountAmount,
        discountAmount,
        cashbackAmount,
        deliveryFee,
        platformFee,
        gstOnPlatform,
        packingFee,
        surcharge,
        tipAmount,
        walletDeduction,
        payableTotal,
        appliedPromoCode,
    } = useCartCalculations();

    return (
        <View style={styles.subtotalSection}>
            <View style={styles.subtotalCard}>
                {/* Item Total */}
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Item Total</Text>
                    <Text style={styles.subtotalValue}>₹{itemTotal.toFixed(2)}</Text>
                </View>

                {/* Auto Offer Discount */}
                {itemDiscountAmount > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={[styles.subtotalLabel, { color: COLORS.success, fontWeight: '600' }]}>
                            🏷️ Offer Discount
                        </Text>
                        <Text style={[styles.subtotalValue, { color: COLORS.success, fontWeight: '700' }]}>
                            - ₹{itemDiscountAmount.toFixed(2)}
                        </Text>
                    </View>
                )}

                {/* Promo Code Discount */}
                {promoDiscountAmount > 0 && (
                    <View style={styles.subtotalRow}>
                        <Text style={[styles.subtotalLabel, { color: COLORS.success, fontWeight: '600' }]}>
                            🎟️ Promo Discount {appliedPromoCode ? `(${appliedPromoCode})` : ''}
                        </Text>
                        <Text style={[styles.subtotalValue, { color: COLORS.success, fontWeight: '700' }]}>
                            - ₹{promoDiscountAmount.toFixed(2)}
                        </Text>
                    </View>
                )}

                {/* Delivery Fee */}
                <View style={[styles.subtotalRow, { alignItems: 'flex-start' }]}>
                    <Text style={styles.subtotalLabel}>Delivery Fee</Text>
                    <Text style={[styles.subtotalValue, deliveryFee === 0 && { color: COLORS.success, fontWeight: '700' }]}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                    </Text>
                </View>

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

                {/* Wallet Cashback Callout (if any) */}
                {cashbackAmount > 0 && (
                    <View style={[styles.subtotalRow, { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginVertical: 4 }]}>
                        <Text style={[styles.subtotalLabel, { color: '#059669', fontWeight: '700', fontSize: 12 }]}>
                            💰 Wallet Cashback on Delivery
                        </Text>
                        <Text style={[styles.subtotalValue, { color: '#059669', fontWeight: '800', fontSize: 12 }]}>
                            + ₹{cashbackAmount.toFixed(2)}
                        </Text>
                    </View>
                )}

                {/* Total Savings Highlight Banner */}
                {discountAmount > 0 && (
                    <View style={styles.savingsHighlightCard}>
                        <Text style={styles.savingsHighlightText}>
                            🎉 Total Savings on this order: ₹{discountAmount.toFixed(2)}
                        </Text>
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
