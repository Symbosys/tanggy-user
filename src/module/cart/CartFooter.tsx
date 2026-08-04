import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { usePaymentStore } from '../../store/payment';
import { useCartCalculations } from './hooks';

interface Props {
    onCheckout: () => void;
    onPaymentMethodPress: () => void;
    noDeliveryPartnerAvailable?: boolean;
}

export const CartFooter: React.FC<Props> = ({ onCheckout, onPaymentMethodPress, noDeliveryPartnerAvailable = false }) => {
    const insets = useSafeAreaInsets();
    const { selectedPaymentMethod } = usePaymentStore();
    const { total } = useCartCalculations();

    const isProceedDisabled = !selectedPaymentMethod || noDeliveryPartnerAvailable;

    return (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.footerContent}>
                {/* Payment Method Selector */}
                <TouchableOpacity
                    style={styles.paymentSelector}
                    onPress={onPaymentMethodPress}
                >
                    {selectedPaymentMethod ? (
                        <View style={styles.paymentSelectedContent}>
                            <View style={styles.paymentIconWrapper}>
                                <MaterialIcons name={selectedPaymentMethod.icon} size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.paymentTextInfo}>
                                <Text style={styles.payUsingText}>Pay using</Text>
                                <Text style={styles.paymentMethodName} numberOfLines={1}>
                                    {selectedPaymentMethod.name}
                                </Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.textSecondary} />
                        </View>
                    ) : (
                        <View style={styles.paymentUnselectedContent}>
                            <View style={styles.paymentIconWrapper}>
                                <MaterialIcons name="payment" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.paymentTextInfo}>
                                <Text style={styles.selectPaymentText}>Select Payment</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={20} color={COLORS.textSecondary} />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Proceed Button */}
                <TouchableOpacity
                    style={[styles.proceedLink, isProceedDisabled && styles.proceedLinkDisabled]}
                    disabled={isProceedDisabled}
                    onPress={onCheckout}
                >
                    <LinearGradient
                        colors={!isProceedDisabled ? [COLORS.primary, COLORS.accent] : ['#E0E0E0', '#BDBDBD']}
                        style={styles.proceedGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.proceedContent}>
                            <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
                            <Text style={styles.proceedLabel}>Proceed</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};
