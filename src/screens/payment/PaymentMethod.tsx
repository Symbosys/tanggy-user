import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import { usePaymentStore, PaymentMethodType } from '../../store/payment';
import { useUserWallet } from '../../api/hooks/useWallet';
import { useCartCalculations } from '../../module/cart/hooks';
import { parseToDecimal } from '../../utils/utils';

const PAYMENT_METHODS: PaymentMethodType[] = [
    {
        id: 'phonepe',
        name: 'PhonePe',
        description: 'Pay securely with PhonePe UPI',
        icon: 'payment',
        isAvailable: true,
        type: 'upi',
    },
    {
        id: '3',
        name: 'Wallet',
        description: 'Pay from your app balance',
        icon: 'wallet',
        isAvailable: true,
        type: 'wallet',
    },
    {
        id: '5',
        name: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        icon: 'payments',
        isAvailable: true,
        type: 'cod',
    },
];

interface RenderablePaymentMethod extends PaymentMethodType {
    badgeText?: string;
    badgeColor?: string;
    badgeBgColor?: string;
}

const PaymentMethodScreen = ({ navigation }: AppNavigation) => {
    const insets = useSafeAreaInsets();
    const { selectedPaymentMethod, setSelectedPaymentMethod } = usePaymentStore();
    const [localSelected, setLocalSelected] = useState<string | null>(selectedPaymentMethod?.id || null);
    const [refreshing, setRefreshing] = useState(false);

    const { data: walletData, refetch, isFetching } = useUserWallet();
    const { total } = useCartCalculations();
    
    // Safely parse the balance to decimal
    const walletBalance = parseToDecimal(walletData?.balance);
    const walletDeduction = Math.min(walletBalance, total);
    const remainingAmount = Math.max(0, parseToDecimal(total - walletDeduction));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (err) {
            console.log('Error refreshing wallet in PaymentMethodScreen:', err);
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Reset selected method if localSelected is Wallet ('3') but wallet cannot cover full order amount
    useEffect(() => {
        if (localSelected === '3' && walletBalance < total) {
            setLocalSelected(null);
        }
    }, [walletBalance, total, localSelected]);

    // Dynamically adjust availability, descriptions, and status badges of payment methods
    const dynamicPaymentMethods: RenderablePaymentMethod[] = PAYMENT_METHODS.map(method => {
        if (method.type === 'wallet') {
            if (walletBalance >= total && total > 0) {
                return {
                    ...method,
                    isAvailable: true,
                    description: `Full amount paid from wallet (Balance: ₹${walletBalance.toFixed(2)})`,
                    badgeText: 'Full Payment Covered',
                    badgeColor: COLORS.success,
                    badgeBgColor: '#E6F4EA',
                };
            } else if (walletBalance > 0) {
                return {
                    ...method,
                    isAvailable: false, // Cannot select Wallet as secondary method for remaining balance
                    description: `₹${walletBalance.toFixed(2)} auto-applied as primary payment. Select PhonePe or COD below for remaining ₹${remainingAmount.toFixed(2)}.`,
                    badgeText: `Primary Applied: ₹${walletBalance.toFixed(2)}`,
                    badgeColor: COLORS.primary,
                    badgeBgColor: COLORS.primary + '18',
                };
            } else {
                return {
                    ...method,
                    isAvailable: false,
                    description: `App wallet balance is ₹0.00`,
                    badgeText: '₹0.00 Balance',
                    badgeColor: COLORS.muted,
                    badgeBgColor: '#F3F4F6',
                };
            }
        }
        if (!method.isAvailable) {
            return {
                ...method,
                badgeText: 'Currently Unavailable',
                badgeColor: '#EF4444',
                badgeBgColor: '#FEE2E2',
            };
        }
        return method;
    });

    const handleSelect = (method: RenderablePaymentMethod) => {
        if (!method.isAvailable) return;
        setLocalSelected(method.id);
    };

    const handleConfirm = () => {
        if (localSelected) {
            const chosenMethod = dynamicPaymentMethods.find(m => m.id === localSelected);
            if (chosenMethod && chosenMethod.isAvailable) {
                setSelectedPaymentMethod(chosenMethod);
                navigation.goBack();
            }
        }
    };

    const renderMethod = (method: RenderablePaymentMethod) => {
        const isSelected = localSelected === method.id;
        const isDisabled = !method.isAvailable;

        return (
            <TouchableOpacity
                key={method.id}
                activeOpacity={isDisabled ? 1 : 0.8}
                onPress={() => handleSelect(method)}
                style={[
                    styles.methodContainer,
                    isSelected && styles.methodSelected,
                    isDisabled && styles.methodDisabled,
                ]}
            >
                <View style={[styles.methodIconContainer, isSelected && { backgroundColor: COLORS.primary + '10' }]}>
                    <MaterialIcons
                        name={method.icon}
                        size={24}
                        color={isDisabled ? COLORS.muted : (isSelected ? COLORS.primary : COLORS.textPrimary)}
                    />
                </View>

                <View style={styles.methodInfo}>
                    <Text style={[
                        styles.methodName,
                        isDisabled && styles.textDisabled
                    ]}>
                        {method.name}
                    </Text>
                    <Text style={[styles.methodDesc, isDisabled && styles.textDisabled]}>
                        {method.description}
                    </Text>
                    {method.badgeText && (
                        <View style={[styles.badge, { backgroundColor: method.badgeBgColor || '#FEE2E2' }]}>
                            <Text style={[styles.badgeText, { color: method.badgeColor || '#EF4444' }]}>
                                {method.badgeText}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.checkContainer}>
                    {isSelected ? (
                        <View style={styles.selectedOuter}>
                            <View style={styles.selectedInner} />
                        </View>
                    ) : (
                        !isDisabled && <View style={styles.uncheckCircle} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Select Payment</Text>
                        <Text style={styles.headerSubtitle}>Choose how you'd like to pay</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isFetching}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {walletBalance > 0 && walletBalance < total && (
                    <View style={styles.walletInfoBanner}>
                        <MaterialIcons name="account-balance-wallet" size={22} color={COLORS.primary} />
                        <Text style={styles.walletInfoBannerText}>
                            <Text style={{ fontWeight: '800', color: COLORS.primary }}>₹{walletBalance.toFixed(2)}</Text> wallet balance will be auto-applied! Select PhonePe or COD below to pay the remaining <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>₹{remainingAmount.toFixed(2)}</Text>.
                        </Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Online Payments</Text>
                    {dynamicPaymentMethods.filter(m => m.type !== 'cod').map(renderMethod)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cash / Pay on Delivery</Text>
                    {dynamicPaymentMethods.filter(m => m.type === 'cod').map(renderMethod)}
                </View>

                <View style={styles.guaranteeContainer}>
                    <MaterialIcons name="verified-user" size={18} color={COLORS.success} />
                    <Text style={styles.guaranteeText}>100% Safe and Secure Payments</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[styles.confirmMainButton, !localSelected && styles.confirmMainButtonDisabled]}
                    disabled={!localSelected}
                    onPress={handleConfirm}
                >
                    <LinearGradient
                        colors={localSelected ? [COLORS.primary, COLORS.accent] : ['#E0E0E0', '#BDBDBD']}
                        style={styles.confirmGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.confirmText}>Proceed to Confirm</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    walletInfoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '12',
        padding: 14,
        borderRadius: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    walletInfoBannerText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    methodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#F1F3F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 3,
    },
    methodSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    methodDisabled: {
        opacity: 0.5,
        backgroundColor: '#F9FAFB',
    },
    methodIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    methodDesc: {
        fontSize: 13,
        color: COLORS.muted,
        marginTop: 2,
        lineHeight: 18,
    },
    textDisabled: {
        color: COLORS.muted,
    },
    checkContainer: {
        marginLeft: 12,
    },
    uncheckCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    badge: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    guaranteeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
        opacity: 0.7,
    },
    guaranteeText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    confirmMainButton: {
        height: 54,
        borderRadius: 14,
        overflow: 'hidden',
    },
    confirmMainButtonDisabled: {
        opacity: 0.6,
    },
    confirmGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    selectedOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 6,
        borderColor: COLORS.primary,
    },
    selectedInner: {
        width: 0,
        height: 0,
    },
});

export default PaymentMethodScreen;
