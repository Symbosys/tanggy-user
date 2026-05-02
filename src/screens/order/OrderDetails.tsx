import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../theme/theme';
import { useOrderDetails } from '../../api/hooks/useOrder';
import { OrderStatus } from '../../types/order.type';
import { LoadingOverlay } from '../../components/ui/loader/LoaderOverLay';
import { useCartStore } from '../../store/cart';
import { parseToDecimal } from '../../utils/utils';

const OrderDetailsScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { orderId, orderNumber } = route.params || {};
    const { addToCart, clearCart } = useCartStore();

    const { data: order, isLoading, isFetching, refetch } = useOrderDetails({ 
        id: orderId, 
        orderNumber: orderNumber 
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={60} color={COLORS.muted} />
                <Text style={styles.errorText}>Order not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const dateObj = new Date(order.createdAt);
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + 
                         dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const handleReorder = async () => {
        try {
            await clearCart();
            for (const item of order.items) {
                await addToCart(item.product.id.toString(), item.quantity);
            }
            navigation.navigate('Cart');
        } catch (error) {
            console.error("Reorder failed", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Gradient Header */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerBackButton}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.orderIdText}>Order #{order.orderNumber.split('-').pop()}</Text>
                    <Text style={styles.statusText}>Status: {order.status.replace('_', ' ')}</Text>
                    <Text style={styles.estimatedText}>
                        {order.status === OrderStatus.DELIVERED ? 'Delivered on ' + new Date(order.timestamps?.deliveredAt || order.updatedAt).toLocaleDateString() : 'Expected soon'}
                    </Text>
                </LinearGradient>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Order Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="calendar-today" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.summaryTextContainer}>
                                    <Text style={styles.summaryLabel}>Ordered On</Text>
                                    <Text style={styles.summaryValue}>{formattedDate}</Text>
                                </View>
                            </View>
                            <View style={styles.summaryRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="home" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.summaryTextContainer}>
                                    <Text style={styles.summaryLabel}>Delivered To</Text>
                                    <Text style={styles.summaryValue}>{order.address?.completeAddress}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Items Ordered Card */}
                    <View style={styles.itemsCard}>
                        <Text style={styles.sectionTitle}>Items Ordered</Text>
                        <View style={styles.itemsList}>
                            {order.items.map((item, index) => (
                                <View key={index}>
                                    {index > 0 && <View style={styles.itemDivider} />}
                                    <View style={[styles.itemRow, index === 0 && styles.firstItemRow]}>
                                        <ImageBackground
                                            source={{ uri: item.product.images?.[0]?.image?.url || 'https://via.placeholder.com/150' }}
                                            style={styles.itemImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.itemDetails}>
                                            <Text style={styles.itemTitle}>{item.product.name}</Text>
                                            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                        </View>
                                        <Text style={styles.itemPrice}>₹{parseToDecimal(item.totalPrice).toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Dynamic Order Status/Delivery Card */}
                    <View style={styles.deliveryCard}>
                        <LinearGradient
                            colors={['rgba(181,143,240,0.08)', 'rgba(249,234,233,0.08)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.deliveryGradient}
                        />
                        <View style={styles.deliveryRow}>
                            <View style={styles.deliveryIconContainer}>
                                {(() => {
                                    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) 
                                        return <Icon name="cancel" size={28} color={COLORS.highlight} />;
                                    if (order.status === OrderStatus.DELIVERED) 
                                        return <Icon name="check-circle" size={28} color={COLORS.success} />;
                                    if ([OrderStatus.PLACED, OrderStatus.VENDOR_PENDING].includes(order.status))
                                        return <Icon name="storefront" size={28} color={COLORS.primary} />;
                                    if ([OrderStatus.VENDOR_ACCEPTED, OrderStatus.PREPARING].includes(order.status))
                                        return <Icon name="soup-kitchen" size={28} color={COLORS.primary} />;
                                    if ([OrderStatus.READY_FOR_PICKUP, OrderStatus.DELIVERY_PENDING].includes(order.status))
                                        return <Icon name="delivery-dining" size={28} color={COLORS.primary} />;
                                    return <Icon name="local-shipping" size={28} color={COLORS.primary} />;
                                })()}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.deliveryLabel}>
                                    {(() => {
                                        if (order.status === OrderStatus.CANCELLED) return 'Order Status';
                                        if (order.status === OrderStatus.DELIVERED) return 'Delivery Status';
                                        if ([OrderStatus.PLACED, OrderStatus.VENDOR_PENDING].includes(order.status)) return 'Store Assignment';
                                        if ([OrderStatus.VENDOR_ACCEPTED, OrderStatus.PREPARING].includes(order.status)) return 'Store Progress';
                                        if ([OrderStatus.READY_FOR_PICKUP, OrderStatus.DELIVERY_PENDING].includes(order.status)) return 'Delivery Assignment';
                                        return 'Delivery Partner';
                                    })()}
                                </Text>
                                <Text style={styles.deliveryName}>
                                    {(() => {
                                        if (order.status === OrderStatus.CANCELLED) return 'Cancelled';
                                        if (order.status === OrderStatus.REFUNDED) return 'Refunded';
                                        if (order.status === OrderStatus.DELIVERED) return 'Delivered';
                                        if (order.orderDeliveryAssignment?.deliveryPartner?.name) 
                                            return order.orderDeliveryAssignment.deliveryPartner.name;
                                        
                                        if ([OrderStatus.PLACED, OrderStatus.VENDOR_PENDING].includes(order.status)) return 'Finding nearby store...';
                                        if (order.status === OrderStatus.VENDOR_ACCEPTED) return 'Store accepted order';
                                        if (order.status === OrderStatus.PREPARING) return 'Store is preparing items';
                                        if (order.status === OrderStatus.READY_FOR_PICKUP) return 'Ready for pickup';
                                        if (order.status === OrderStatus.DELIVERY_PENDING) return 'Searching for delivery partner...';
                                        
                                        return 'Processing...';
                                    })()}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Only show Track button when it's out for delivery or ready */}
                        {[OrderStatus.READY_FOR_PICKUP, OrderStatus.DELIVERY_PENDING, OrderStatus.OUT_FOR_DELIVERY].includes(order.status) && (
                            <TouchableOpacity 
                                style={styles.trackButtonContainer}
                                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id.toString() })}
                            >
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
                        )}
                    </View>

                    {/* Payment Summary Card */}
                    <View style={styles.paymentCard}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.paymentList}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Subtotal</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.itemTotal).toFixed(2)}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.deliveryFee).toFixed(2)}</Text>
                            </View>
                            {parseToDecimal(order.discountAmount) > 0 && (
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Discount</Text>
                                    <Text style={styles.paymentDiscount}>- ₹{parseToDecimal(order.discountAmount).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.paymentDivider} />
                            <View style={styles.paymentTotalRow}>
                                <Text style={styles.paymentTotalLabel}>Total Paid</Text>
                                <Text style={styles.paymentTotalValue}>₹{parseToDecimal(order.subtotal).toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.paymentMethodContainer}>
                            <Icon name="payment" size={20} color={COLORS.primary} />
                            <Text style={styles.paymentMethodText}>Paid via {order.paymentMethod}</Text>
                        </View>
                    </View>

                    {/* Action Buttons Section */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.reorderButtonContainer} onPress={handleReorder}>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        fontSize: 18,
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    backBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
    },
    backBtnText: {
        color: COLORS.white,
        fontWeight: '700',
    },
});

export default OrderDetailsScreen;