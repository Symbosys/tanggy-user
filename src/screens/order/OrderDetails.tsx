import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../theme/theme';
import { useOrderDetails } from '../../api/hooks/useOrder';
import { OrderStatus } from '../../types/order.type';
import { useCartStore } from '../../store/cart';
import { parseToDecimal } from '../../utils/utils';

const { width } = Dimensions.get('window');

const OrderDetailsScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { orderId, orderNumber } = route.params || {};
    const { addToCart, clearCart } = useCartStore();

    const { data: order, isLoading, isFetching, refetch } = useOrderDetails(
        orderId ? { id: orderId } : { orderNumber: orderNumber }
    );

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

    const isDelivered = order.status === OrderStatus.DELIVERED;
    const isCancelled = order.status === OrderStatus.CANCELLED;
    const isRefunded = order.status === OrderStatus.REFUNDED;
    const isDisputed = order.status === OrderStatus.DISPUTED;

    const dateObj = new Date(order.createdAt);
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + 
                         dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const vendor = order.orderVendorAssignments?.vendor;
    const deliveryAssignment = order.orderDeliveryAssignment;
    const deliveryPartner = deliveryAssignment?.deliveryPartner;

    // Hiding courier details if delivered more than 30 minutes ago
    const deliveredAtTime = new Date(order.timestamps?.deliveredAt || order.updatedAt).getTime();
    const isDeliveredOver30Min = isDelivered && ((new Date().getTime() - deliveredAtTime) > 30 * 60 * 1000);

    const handleReorder = async () => {
        try {
            await clearCart();
            for (const item of order.items) {
                await addToCart(item.product.id.toString(), item.quantity, item.product);
            }
            navigation.navigate('Cart');
        } catch (error) {
            console.error("Reorder failed", error);
        }
    };

    const handleCall = (phoneNumber?: string) => {
        if (!phoneNumber) return;
        Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
            console.error("Failed to make call", err);
        });
    };

    // Stepper mapping
    const getStatusRank = (status: OrderStatus): number => {
        switch(status) {
            case OrderStatus.PLACED:
            case OrderStatus.VENDOR_PENDING:
                return 1;
            case OrderStatus.VENDOR_ACCEPTED:
                return 2;
            case OrderStatus.PREPARING:
            case OrderStatus.READY_FOR_PICKUP:
            case OrderStatus.DELIVERY_PENDING:
                return 3;
            case OrderStatus.OUT_FOR_DELIVERY:
                return 4;
            case OrderStatus.DELIVERED:
                return 5;
            default:
                return 1;
        }
    };

    const currentRank = getStatusRank(order.status);
    const steps = [
        { rank: 1, title: 'Order Placed', desc: 'Order received & processed' },
        { rank: 2, title: 'Order Confirmed', desc: 'Store accepted your order' },
        { rank: 3, title: 'Items Prepared', desc: 'Packed & ready for pickup' },
        { rank: 4, title: 'Out for Delivery', desc: 'Rider is on the way' },
        { rank: 5, title: 'Delivered', desc: 'Order delivered successfully' }
    ];

    // Determine header details dynamically
    const getHeaderDetails = () => {
        if (isDelivered) {
            return {
                colors: ['#059669', '#10B981'],
                statusText: 'Delivered Successfully!',
                estimatedText: 'Delivered on ' + new Date(order.timestamps?.deliveredAt || order.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' }),
                badgeIcon: 'check-circle',
                badgeText: 'Delivered',
                badgeColor: '#059669'
            };
        } else if (isCancelled) {
            return {
                colors: ['#EF4444', '#F87171'],
                statusText: 'Order Cancelled',
                estimatedText: 'This order has been cancelled',
                badgeIcon: 'cancel',
                badgeText: 'Cancelled',
                badgeColor: '#DC2626'
            };
        } else if (isRefunded) {
            return {
                colors: ['#F59E0B', '#FBBF24'],
                statusText: 'Order Refunded',
                estimatedText: 'Refund processed successfully',
                badgeIcon: 'payment',
                badgeText: 'Refunded',
                badgeColor: '#D97706'
            };
        } else if (isDisputed) {
            return {
                colors: ['#EAB308', '#FDE047'],
                statusText: 'Order Disputed',
                estimatedText: 'Dispute under review by support',
                badgeIcon: 'warning',
                badgeText: 'Disputed',
                badgeColor: '#CA8A04'
            };
        } else {
            return {
                colors: [COLORS.primary, COLORS.accent],
                statusText: `Status: ${order.status.replace('_', ' ')}`,
                estimatedText: 'Expected at your doorstep soon',
                badgeIcon: '',
                badgeText: '',
                badgeColor: ''
            };
        }
    };

    const header = getHeaderDetails();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor={header.colors[0]} 
                translucent={false} 
            />
            
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[header.colors[0]]}
                        tintColor={header.colors[0]}
                    />
                }
            >
                {/* Header Gradient */}
                <LinearGradient
                    colors={header.colors as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerBackButton}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        
                        {header.badgeText !== '' && (
                            <View style={styles.headerBadge}>
                                <Icon name={header.badgeIcon} size={16} color={header.badgeColor} />
                                <Text style={[styles.headerBadgeText, { color: header.badgeColor }]}>{header.badgeText}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.orderIdText}>Order #{order.orderNumber.split('-').pop()}</Text>
                    <Text style={styles.statusText}>{header.statusText}</Text>
                    <Text style={styles.estimatedText}>{header.estimatedText}</Text>
                </LinearGradient>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    
                    {/* Banners based on Order Status */}
                    {isDelivered && (
                        <View style={styles.celebrationBanner}>
                            <View style={styles.celebrationIconWrapper}>
                                <Ionicons name="gift-outline" size={24} color="#059669" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.celebrationTitle}>Delivered & Verified</Text>
                                <Text style={styles.celebrationDesc}>
                                    Your order was delivered. We hope you enjoy your fresh groceries!
                                </Text>
                            </View>
                        </View>
                    )}

                    {isCancelled && (
                        <View style={[styles.statusBanner, styles.cancelledBanner]}>
                            <View style={[styles.bannerIconWrapper, styles.cancelledIconWrapper]}>
                                <Icon name="block" size={24} color="#DC2626" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bannerTitle, styles.cancelledTitle]}>Order Cancelled</Text>
                                <Text style={[styles.bannerDesc, styles.cancelledDesc]}>
                                    This order was cancelled. If payment was made, a refund will be processed back to your source account.
                                </Text>
                            </View>
                        </View>
                    )}

                    {isRefunded && (
                        <View style={[styles.statusBanner, styles.refundedBanner]}>
                            <View style={[styles.bannerIconWrapper, styles.refundedIconWrapper]}>
                                <Icon name="check-circle-outline" size={24} color="#D97706" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bannerTitle, styles.refundedTitle]}>Refund Processed</Text>
                                <Text style={[styles.bannerDesc, styles.refundedDesc]}>
                                    The refund has been successfully initiated and credited back to your payment account.
                                </Text>
                            </View>
                        </View>
                    )}

                    {isDisputed && (
                        <View style={[styles.statusBanner, styles.disputedBanner]}>
                            <View style={[styles.bannerIconWrapper, styles.disputedIconWrapper]}>
                                <Icon name="gavel" size={24} color="#CA8A04" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bannerTitle, styles.disputedTitle]}>Dispute Under Review</Text>
                                <Text style={[styles.bannerDesc, styles.disputedDesc]}>
                                    Our support department is currently auditing the concerns raised on this order. We will reach out shortly.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 1. Stepper Timeline Card (Only for Ongoing / Delivered, not Cancelled/Refunded/Disputed) */}
                    {!isCancelled && !isRefunded && !isDisputed && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Tracking Status</Text>
                            <View style={styles.timelineContainer}>
                                {steps.map((step, index) => {
                                    const isActive = currentRank >= step.rank;
                                    const isCurrent = currentRank === step.rank;
                                    const showLine = index < steps.length - 1;
                                    
                                    // Highlight line if next rank is active too
                                    const isLineActive = currentRank > step.rank;
                                    
                                    return (
                                        <View key={step.rank} style={styles.timelineRow}>
                                            <View style={styles.timelineIndicator}>
                                                <View style={[
                                                    styles.timelineDot,
                                                    isActive && styles.activeDot,
                                                    isCurrent && styles.currentDot,
                                                    isDelivered && isActive && styles.deliveredDot,
                                                ]}>
                                                    {isActive && (
                                                        <Icon 
                                                            name="check" 
                                                            size={10} 
                                                            color="#ffffff" 
                                                        />
                                                    )}
                                                </View>
                                                {showLine && (
                                                    <View style={[
                                                        styles.timelineLine,
                                                        isLineActive && styles.activeLine,
                                                        isDelivered && isLineActive && styles.deliveredLine,
                                                    ]} />
                                                )}
                                            </View>
                                            <View style={styles.timelineContent}>
                                                <Text style={[
                                                    styles.timelineTitleText,
                                                    isActive && styles.activeTimelineTitle,
                                                    isDelivered && isActive && styles.deliveredTimelineTitle,
                                                ]}>
                                                    {step.title}
                                                </Text>
                                                <Text style={styles.timelineDescText}>{step.desc}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Only show Track button when it's out for delivery or ready */}
                            {[OrderStatus.READY_FOR_PICKUP, OrderStatus.DELIVERY_PENDING, OrderStatus.OUT_FOR_DELIVERY].includes(order.status) && (
                                <TouchableOpacity 
                                    style={styles.trackButtonContainer}
                                    onPress={() => navigation.navigate('OrderTracking', { id: order.id.toString() })}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.accent]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.trackButton}
                                    >
                                        <Icon name="pin-drop" size={20} color="#ffffff" />
                                        <Text style={styles.trackButtonText}>Track Live Order</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* 2. Order Details Summary Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Summary Details</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryRow}>
                                <View style={[styles.iconContainer, (isDelivered && styles.deliveredIconContainer) || (isCancelled && styles.cancelledIconContainer) || ((isRefunded || isDisputed) && styles.warningIconContainer)]}>
                                    <Icon 
                                        name="calendar-today" 
                                        size={18} 
                                        color={isDelivered ? '#059669' : isCancelled ? '#DC2626' : (isRefunded || isDisputed) ? '#D97706' : COLORS.primary} 
                                    />
                                </View>
                                <View style={styles.summaryTextContainer}>
                                    <Text style={styles.summaryLabel}>Ordered On</Text>
                                    <Text style={styles.summaryValue}>{formattedDate}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryRow}>
                                <View style={[styles.iconContainer, (isDelivered && styles.deliveredIconContainer) || (isCancelled && styles.cancelledIconContainer) || ((isRefunded || isDisputed) && styles.warningIconContainer)]}>
                                    <Icon 
                                        name="home" 
                                        size={18} 
                                        color={isDelivered ? '#059669' : isCancelled ? '#DC2626' : (isRefunded || isDisputed) ? '#D97706' : COLORS.primary} 
                                    />
                                </View>
                                <View style={styles.summaryTextContainer}>
                                    <Text style={styles.summaryLabel}>Delivered To</Text>
                                    <Text style={styles.summaryValue}>{order.address?.completeAddress || 'No address specified'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 3. Items Ordered Card */}
                    <View style={styles.card}>
                        <View style={styles.itemsHeader}>
                            <Text style={styles.cardTitle}>Items Ordered</Text>
                            <View style={[styles.itemsBadge, (isDelivered && styles.deliveredItemsBadge) || (isCancelled && styles.cancelledItemsBadge) || ((isRefunded || isDisputed) && styles.warningItemsBadge)]}>
                                <Text style={[
                                    styles.itemsBadgeText, 
                                    isDelivered && { color: '#059669' }, 
                                    isCancelled && { color: '#DC2626' }, 
                                    (isRefunded || isDisputed) && { color: '#D97706' }
                                ]}>
                                    {order.items?.length || 0} items
                                </Text>
                            </View>
                        </View>
                        <View style={styles.itemsList}>
                            {order.items.map((item: any, index: number) => (
                                <View key={index}>
                                    {index > 0 && <View style={styles.itemDivider} />}
                                    <View style={styles.itemRow}>
                                        <Image
                                            source={{ uri: item.product.images?.[0]?.image?.url || 'https://via.placeholder.com/150' }}
                                            style={styles.itemImage}
                                        />
                                        <View style={styles.itemDetails}>
                                            <Text style={styles.itemTitle}>{item.product.name}</Text>
                                            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                        </View>
                                        <Text style={styles.itemPrice}>₹{parseToDecimal(item.totalPrice).toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 4. Delivery Partner Card (Hidden if delivered > 30 minutes ago) */}
                    {deliveryPartner && !isDeliveredOver30Min && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Delivery Executive</Text>
                            <View style={styles.partnerRow}>
                                <Image
                                    source={{ uri: deliveryPartner.image?.url || 'https://cdn-icons-png.flaticon.com/512/4662/4662927.png' }}
                                    style={styles.partnerAvatar}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.partnerName}>{deliveryPartner.name}</Text>
                                    <Text style={styles.partnerSubtitle}>Delivery Professional</Text>
                                </View>
                                {deliveryPartner.mobile && (
                                    <TouchableOpacity 
                                        style={styles.callIconBtn} 
                                        onPress={() => handleCall(deliveryPartner.mobile)}
                                    >
                                        <Icon name="call" size={18} color={isDelivered ? '#059669' : COLORS.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* 5. Delivery OTP Confirmation Card (Hidden if delivered, cancelled, refunded, disputed) */}
                    {deliveryAssignment?.deliveryOtp && !isDelivered && !isCancelled && !isRefunded && !isDisputed && (
                        <View style={styles.otpCard}>
                            <LinearGradient
                                colors={['rgba(34,197,94,0.08)', 'rgba(34,197,94,0.02)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.otpCardGradient}
                            />
                            <View style={styles.otpContent}>
                                <Icon name="lock-outline" size={28} color="#22C55E" style={{ marginTop: 2 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.otpTitle}>Delivery Verification Code</Text>
                                    <Text style={styles.otpCode}>{deliveryAssignment.deliveryOtp}</Text>
                                    <Text style={styles.otpSubtitle}>Share this OTP with the rider when they arrive to confirm delivery.</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* 6. Payment Summary Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Payment Summary</Text>
                        <View style={styles.paymentList}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Item Total</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.itemTotal).toFixed(2)}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.deliveryFee).toFixed(2)}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Platform Fee</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.platformFee).toFixed(2)}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Packing Fee</Text>
                                <Text style={styles.paymentValue}>₹{parseToDecimal(order.packingFee).toFixed(2)}</Text>
                            </View>
                            {parseToDecimal(order.surcharge) > 0 && (
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Surcharge</Text>
                                    <Text style={styles.paymentValue}>₹{parseToDecimal(order.surcharge).toFixed(2)}</Text>
                                </View>
                            )}
                            {parseToDecimal(order.discountAmount) > 0 && (
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentLabel}>Discount</Text>
                                    <Text style={styles.paymentDiscount}>- ₹{parseToDecimal(order.discountAmount).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.paymentDivider} />
                            <View style={styles.paymentTotalRow}>
                                <Text style={styles.paymentTotalLabel}>Total Paid</Text>
                                <Text style={styles.paymentTotalValue}>
                                    ₹{(
                                        parseToDecimal(order.itemTotal) +
                                        parseToDecimal(order.deliveryFee) +
                                        parseToDecimal(order.platformFee) +
                                        parseToDecimal(order.packingFee) +
                                        parseToDecimal(order.surcharge) -
                                        parseToDecimal(order.discountAmount)
                                    ).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.paymentMethodContainer}>
                            <Icon 
                                name="payment" 
                                size={18} 
                                color={isDelivered ? '#059669' : isCancelled ? '#DC2626' : (isRefunded || isDisputed) ? '#D97706' : COLORS.primary} 
                            />
                            <Text style={styles.paymentMethodText}>Paid via {order.paymentMethod}</Text>
                        </View>
                    </View>

                    {/* 7. Action Buttons Section */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.reorderButtonContainer} onPress={handleReorder}>
                            <LinearGradient
                                colors={
                                    isDelivered ? ['#059669', '#10B981'] : 
                                    isCancelled ? ['#EF4444', '#F87171'] : 
                                    (isRefunded || isDisputed) ? ['#F59E0B', '#FBBF24'] : 
                                    [COLORS.primary, COLORS.accent]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.reorderButton}
                            >
                                <Icon name="replay" size={20} color="#ffffff" />
                                <Text style={styles.reorderButtonText}>Reorder Items</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity style={[
                                styles.secondaryButton, 
                                isDelivered && styles.deliveredSecondaryButton,
                                isCancelled && styles.cancelledSecondaryButton,
                                (isRefunded || isDisputed) && styles.warningSecondaryButton
                            ]}>
                                <View style={styles.secondaryButtonContent}>
                                    <Icon 
                                        name="receipt-long" 
                                        size={18} 
                                        color={isDelivered ? '#059669' : isCancelled ? '#DC2626' : (isRefunded || isDisputed) ? '#D97706' : COLORS.primary} 
                                    />
                                    <Text style={[
                                        styles.secondaryButtonText, 
                                        isDelivered && styles.deliveredSecondaryButtonText,
                                        isCancelled && styles.cancelledSecondaryButtonText,
                                        (isRefunded || isDisputed) && styles.warningSecondaryButtonText
                                    ]}>Invoice</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.secondaryButton, 
                                isDelivered && styles.deliveredSecondaryButton,
                                isCancelled && styles.cancelledSecondaryButton,
                                (isRefunded || isDisputed) && styles.warningSecondaryButton
                            ]}>
                                <View style={styles.secondaryButtonContent}>
                                    <Icon 
                                        name="help-outline" 
                                        size={18} 
                                        color={isDelivered ? '#059669' : isCancelled ? '#DC2626' : (isRefunded || isDisputed) ? '#D97706' : COLORS.primary} 
                                    />
                                    <Text style={[
                                        styles.secondaryButtonText, 
                                        isDelivered && styles.deliveredSecondaryButtonText,
                                        isCancelled && styles.cancelledSecondaryButtonText,
                                        (isRefunded || isDisputed) && styles.warningSecondaryButtonText
                                    ]}>Get Help</Text>
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
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    headerGradient: {
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 16,
        // Shadows for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    headerBackButton: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    headerBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    orderIdText: {
        marginTop: 14,
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    statusText: {
        marginTop: 6,
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.95)',
    },
    estimatedText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    mainContent: {
        padding: 16,
        gap: 16,
    },
    celebrationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#C8E6C9',
        borderRadius: 16,
        padding: 16,
        gap: 14,
    },
    celebrationIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    celebrationTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#2E7D32',
    },
    celebrationDesc: {
        fontSize: 12,
        color: '#4E7D52',
        marginTop: 2,
        lineHeight: 16,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 14,
    },
    bannerIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    bannerDesc: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16,
    },
    cancelledBanner: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },
    cancelledIconWrapper: {
        backgroundColor: '#FFFFFF',
    },
    cancelledTitle: {
        color: '#991B1B',
    },
    cancelledDesc: {
        color: '#B91C1C',
    },
    refundedBanner: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FCD34D',
    },
    refundedIconWrapper: {
        backgroundColor: '#FFFFFF',
    },
    refundedTitle: {
        color: '#92400E',
    },
    refundedDesc: {
        color: '#B45309',
    },
    disputedBanner: {
        backgroundColor: '#FEF9C3',
        borderColor: '#FDE047',
    },
    disputedIconWrapper: {
        backgroundColor: '#FFFFFF',
    },
    disputedTitle: {
        color: '#854D0E',
    },
    disputedDesc: {
        color: '#A16207',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        // Shadows
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    summaryGrid: {
        gap: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F1F3F5',
    },
    iconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: '#F3E5F5',
    },
    deliveredIconContainer: {
        backgroundColor: '#E8F5E9',
    },
    cancelledIconContainer: {
        backgroundColor: '#FEE2E2',
    },
    warningIconContainer: {
        backgroundColor: '#FEF3C7',
    },
    summaryTextContainer: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#222222',
        marginTop: 2,
        lineHeight: 18,
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemsBadge: {
        backgroundColor: '#F3E5F5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    deliveredItemsBadge: {
        backgroundColor: '#E8F5E9',
    },
    cancelledItemsBadge: {
        backgroundColor: '#FEE2E2',
    },
    warningItemsBadge: {
        backgroundColor: '#FEF3C7',
    },
    itemsBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
    },
    itemsList: {
        gap: 12,
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#ECEFF1',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    itemImage: {
        width: 52,
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ECEFF1',
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
        lineHeight: 18,
    },
    itemQuantity: {
        fontSize: 12,
        fontWeight: '600',
        color: '#777777',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
    },
    partnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    partnerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    partnerName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
    },
    partnerSubtitle: {
        fontSize: 12,
        color: '#757575',
        marginTop: 1,
    },
    callIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(146, 53, 208, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackButtonContainer: {
        marginTop: 14,
    },
    trackButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    trackButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    otpCard: {
        borderRadius: 16,
        padding: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    otpCardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    otpContent: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
    },
    otpTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    otpCode: {
        fontSize: 28,
        fontWeight: '800',
        color: '#22C55E',
        letterSpacing: 4,
        marginVertical: 4,
    },
    otpSubtitle: {
        fontSize: 12,
        color: '#666666',
        lineHeight: 16,
    },
    paymentList: {
        gap: 10,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentLabel: {
        fontSize: 13,
        color: '#666666',
    },
    paymentValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#222222',
    },
    paymentDiscount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#22C55E',
    },
    paymentDivider: {
        marginVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#ECEFF1',
        borderStyle: 'dashed',
    },
    paymentTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentTotalLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    paymentTotalValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    paymentMethodContainer: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        padding: 10,
    },
    paymentMethodText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#555555',
    },
    actionsSection: {
        gap: 12,
        marginTop: 8,
    },
    reorderButtonContainer: {
        width: '100%',
    },
    reorderButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
    },
    reorderButtonText: {
        fontSize: 15,
        fontWeight: '700',
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
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
    },
    secondaryButtonContent: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    deliveredSecondaryButton: {
        borderColor: '#059669',
    },
    deliveredSecondaryButtonText: {
        color: '#059669',
    },
    cancelledSecondaryButton: {
        borderColor: '#DC2626',
    },
    cancelledSecondaryButtonText: {
        color: '#DC2626',
    },
    warningSecondaryButton: {
        borderColor: '#D97706',
    },
    warningSecondaryButtonText: {
        color: '#D97706',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 15,
        color: '#666666',
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#222222',
        fontWeight: '700',
    },
    backBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
    },
    backBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    
    // Timeline Stepper Styles
    timelineContainer: {
        marginTop: 10,
        paddingLeft: 4,
    },
    timelineRow: {
        flexDirection: 'row',
        minHeight: 52,
    },
    timelineIndicator: {
        alignItems: 'center',
        width: 24,
    },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ECEFF1',
        borderWidth: 2,
        borderColor: '#CFD8DC',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        borderColor: '#E1BEE7',
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    currentDot: {
        backgroundColor: COLORS.primary,
        borderColor: '#B58FF0',
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    deliveredDot: {
        backgroundColor: '#059669',
        borderColor: '#A7F3D0',
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#ECEFF1',
        marginVertical: 2,
        zIndex: 1,
    },
    activeLine: {
        backgroundColor: COLORS.primary,
    },
    deliveredLine: {
        backgroundColor: '#059669',
    },
    timelineContent: {
        flex: 1,
        marginLeft: 14,
        paddingBottom: 16,
    },
    timelineTitleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#777777',
    },
    activeTimelineTitle: {
        fontWeight: '700',
        color: COLORS.primary,
    },
    deliveredTimelineTitle: {
        color: '#059669',
    },
    timelineDescText: {
        fontSize: 11,
        color: '#999999',
        marginTop: 2,
    },
});

export default OrderDetailsScreen;