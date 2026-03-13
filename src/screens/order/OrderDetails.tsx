import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';

const OrderDetailsScreen: React.FC = () => {
    const items = [
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx6CjlaJZw2ozZJVSdOSga0kc8N9AanrlYTGJmDuHYRpluStFwFDy_3S2fNkc_24V3C_AsGu-borZLlFJxeqXfDMIsrU_yqaBuJkZ8WVVRffLiCWQGGNcS40v45YSD8gxHQO20r0QuL8FQC4jq_HXc9l12ii_dASpLavAVQivQV1Ya0JPFrarS1uwJVFmCSxkm5KPPKeIy6apb8urD7Sk4_JXkeTjhpslu6m94FOMr78xGX9hMuVNzf1uoB8Y49panSpctdwoIhKwu',
            title: 'Fresh Chicken Curry Cut',
            quantity: '2 x 500g',
            price: '₹250.00',
        },
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt6hDPFQ1997HZGGPOhHCkDUz4uIUC5q_1dEYzZQ3AOq8-qV7uvuIs2xvQrXuNof0dyeH4Bytz9aeex573ONcq31NNAlioON2GHMrbV-DC53KD8XYVnjph5jpZg4TkVCd-Tv91uXOj85qt03al-wEfIYHg7qIhv8S5hmGC5JR_kFHI6NKsqqDiJyABbstZXaHzR-nnGt6mwQR0wS5sUPxK47KsJVIR3lfakRmyYPIsEQFDY_kbFKqZlabj2EK2SjnXYkfWOe6REp5j',
            title: 'Mutton Keema',
            quantity: '1 x 250g',
            price: '₹180.00',
        },
    ];

    const summaryItems = [
        {
            icon: 'calendar_today',
            label: 'Ordered On',
            value: '15 August 2024, 10:30 AM',
        },
        {
            icon: 'storefront',
            label: 'Vendor',
            value: 'MintaFresh Meats',
        },
        {
            icon: 'home',
            label: 'Delivered To',
            value: '123 Fresh St, Flavor Town, 54321',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Gradient Header */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerBackButton}>
                        <TouchableOpacity style={styles.backButton}>
                            <Icon name="arrow-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.orderIdText}>Order #ORD-2025-1084</Text>
                    <Text style={styles.statusText}>Status: Out for Delivery 🚚</Text>
                    <Text style={styles.estimatedText}>Estimated Arrival: 4:30 PM</Text>
                </LinearGradient>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Order Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryGrid}>
                            {summaryItems.map((item, index) => (
                                <View key={index} style={styles.summaryRow}>
                                    <View style={styles.iconContainer}>
                                        <Icon name={item.icon as any} size={20} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.summaryTextContainer}>
                                        <Text style={styles.summaryLabel}>{item.label}</Text>
                                        <Text style={styles.summaryValue}>{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Items Ordered Card */}
                    <View style={styles.itemsCard}>
                        <Text style={styles.sectionTitle}>Items Ordered</Text>
                        <View style={styles.itemsList}>
                            {items.map((item, index) => (
                                <View key={index}>
                                    {index > 0 && <View style={styles.itemDivider} />}
                                    <View style={[styles.itemRow, index === 0 && styles.firstItemRow]}>
                                        <ImageBackground
                                            source={{ uri: item.image }}
                                            style={styles.itemImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.itemDetails}>
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                            <Text style={styles.itemQuantity}>{item.quantity}</Text>
                                        </View>
                                        <Text style={styles.itemPrice}>{item.price}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Delivery Information Card */}
                    <View style={styles.deliveryCard}>
                        <LinearGradient
                            colors={['rgba(181,143,240,0.08)', 'rgba(249,234,233,0.08)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.deliveryGradient}
                        />
                        <View style={styles.deliveryRow}>
                            <View style={styles.deliveryIconContainer}>
                                <Icon name="local-shipping" size={28} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.deliveryLabel}>Delivery Partner</Text>
                                <Text style={styles.deliveryName}>
                                    Rohan Sharma{' '}
                                    <Text style={styles.deliveryPhone}>(+91 9876543210)</Text>
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.trackButtonContainer}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.trackButton}
                            >
                                <Icon name="pin-drop" size={20} color="#ffffff" />
                                <Text style={styles.trackButtonText}>Track Order</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Summary Card */}
                    <View style={styles.paymentCard}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.paymentList}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Subtotal</Text>
                                <Text style={styles.paymentValue}>₹430.00</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                                <Text style={styles.paymentValue}>₹40.00</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Discount</Text>
                                <Text style={styles.paymentDiscount}>- ₹20.00</Text>
                            </View>
                            <View style={styles.paymentDivider} />
                            <View style={styles.paymentTotalRow}>
                                <Text style={styles.paymentTotalLabel}>Total Paid</Text>
                                <Text style={styles.paymentTotalValue}>₹450.00</Text>
                            </View>
                        </View>
                        <View style={styles.paymentMethodContainer}>
                            <Icon name="credit-card" size={20} color={COLORS.primary} />
                            <Text style={styles.paymentMethodText}>Paid via Card ending in 1234</Text>
                        </View>
                    </View>

                    {/* Action Buttons Section */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.reorderButtonContainer}>
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.reorderButton}
                            >
                                <Icon name="replay" size={20} color="#ffffff" />
                                <Text style={styles.reorderButtonText}>Reorder</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <View style={styles.secondaryButtonContent}>
                                    <Icon name="receipt-long" size={20} color={COLORS.primary} />
                                    <Text style={styles.secondaryButtonText}>View Invoice</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <View style={styles.secondaryButtonContent}>
                                    <Icon name="help-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.secondaryButtonText}>Help</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerGradient: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 16,
    },
    headerBackButton: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderIdText: {
        marginTop: 8,
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.75,
        color: '#ffffff',
    },
    statusText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '800',
        opacity: 0.9,
        color: '#ffffff',
    },
    estimatedText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '800',
        opacity: 0.8,
        color: '#ffffff',
    },
    mainContent: {
        padding: 16,
        paddingTop: 20,
        gap: 20,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 25,
        elevation: 5,
    },
    summaryGrid: {
        gap: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        backgroundColor: 'rgba(181,143,240,0.1)',
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    itemsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 25,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        color: COLORS.textPrimary,
    },
    itemsList: {
        marginTop: 16,
        gap: 12,
    },
    itemDivider: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 12,
    },
    firstItemRow: {
        paddingTop: 0,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    deliveryCard: {
        borderRadius: 18,
        padding: 20,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 25,
        elevation: 5,
    },
    deliveryGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    deliveryIconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deliveryLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    deliveryName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    deliveryPhone: {
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    trackButtonContainer: {
        marginTop: 16,
    },
    trackButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 9999,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    trackButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    paymentCard: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 25,
        elevation: 5,
    },
    paymentList: {
        marginTop: 16,
        gap: 12,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    paymentDiscount: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.highlight,
    },
    paymentDivider: {
        marginVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    paymentTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    paymentTotalValue: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    paymentMethodContainer: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        padding: 12,
    },
    paymentMethodText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    actionsSection: {
        paddingTop: 16,
        paddingBottom: 8,
        gap: 12,
    },
    reorderButtonContainer: {
        width: '100%',
    },
    reorderButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 9999,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    reorderButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        paddingVertical: 12,
    },
    secondaryButtonContent: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
});

export default OrderDetailsScreen;