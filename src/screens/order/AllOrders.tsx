import { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { Order, OrderStatus } from '../../types/order.type';
import { LoadingOverlay } from '../../components/ui/loader/LoaderOverLay';
import { useOrders } from '../../api/hooks/useOrder';

const { width } = Dimensions.get('window');

interface OrderItemUI {
    id: string;
    orderNumber: string;
    date: string;
    time: string;
    amount: string;
    status: OrderStatus;
    statusColor: string;
    items: Array<{
        id: string;
        name: string;
        image: string;
        quantity: number;
    }>;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; icon: string; label: string }> = {
    [OrderStatus.PLACED]: { color: '#6366F1', icon: 'package-variant-closed', label: 'Placed' },
    [OrderStatus.VENDOR_PENDING]: { color: '#F59E0B', icon: 'store-search', label: 'Finding Store' },
    [OrderStatus.VENDOR_ACCEPTED]: { color: '#10B981', icon: 'store-check', label: 'Accepted' },
    [OrderStatus.PREPARING]: { color: '#8B5CF6', icon: 'pot-steam', label: 'Preparing' },
    [OrderStatus.READY_FOR_PICKUP]: { color: '#06B6D4', icon: 'bag-checked', label: 'Ready' },
    [OrderStatus.DELIVERY_PENDING]: { color: '#F59E0B', icon: 'moped-electric', label: 'Assigning Rider' },
    [OrderStatus.OUT_FOR_DELIVERY]: { color: '#3B82F6', icon: 'moped', label: 'Out for Delivery' },
    [OrderStatus.DELIVERED]: { color: '#10B981', icon: 'check-circle', label: 'Delivered' },
    [OrderStatus.CANCELLED]: { color: '#EF4444', icon: 'close-circle', label: 'Cancelled' },
    [OrderStatus.REFUNDED]: { color: '#6B7280', icon: 'cash-refund', label: 'Refunded' },
    [OrderStatus.DISPUTED]: { color: '#F43F5E', icon: 'alert-circle', label: 'Disputed' },
};

export default function AllOrdersScreen() {
    const [selectedTab, setSelectedTab] = useState<'Ongoing' | 'Past Orders'>('Ongoing');
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const { data: orderData, isLoading, isFetching, refetch } = useOrders({
        page,
        limit: LIMIT,
        statusType: selectedTab === 'Ongoing' ? 'ongoing' : 'past',
    });

    console.log("orderData", orderData);

    const orders: Order[] = orderData?.orders || [];
    const hasMore = (orderData?.currentPage || 1) < (orderData?.totalPage || 1);

    const uiOrders: OrderItemUI[] = orders.map((order: any) => {
        const dateObj = new Date(order.createdAt);
        const subtotal = order.subtotal || 0;
        const paidAmount = order.paidAmount || 0;
        
        return {
            id: order.id.toString(),
            orderNumber: order.orderNumber,
            date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            amount: `₹${(paidAmount || subtotal).toFixed(2)}`,
            status: order.status,
            statusColor: STATUS_CONFIG[order.status as OrderStatus]?.color || COLORS.primary,
            items: order.items?.map((item: any) => ({
                id: item.id.toString(),
                name: item.product?.name || 'Item',
                image: item.product?.image || 'https://via.placeholder.com/150?text=No+Image',
                quantity: item.quantity,
            })) || [],
        };
    });

    const onRefresh = useCallback(() => {
        setPage(1);
        refetch();
    }, [refetch]);

    const loadMore = useCallback(() => {
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isFetching, hasMore]);

    const handleTabChange = useCallback((tab: 'Ongoing' | 'Past Orders') => {
        setSelectedTab(tab);
        setPage(1);
    }, []);

    const renderOrderCard = ({ item }: { item: OrderItemUI }) => {
        const config = STATUS_CONFIG[item.status];

        return (
            <TouchableOpacity activeOpacity={0.9} style={styles.orderCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderIdText}>Order #{item.orderNumber.split('-').pop()}</Text>
                        <View style={styles.dateTimeContainer}>
                            <MaterialCommunityIcons name="calendar-clock" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.dateTimeText}>{item.date} at {item.time}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                        <MaterialCommunityIcons name={config.icon as any} size={14} color={config.color} />
                        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                    </View>
                </View>

                {/* Items Row */}
                <View style={styles.itemsPreviewContainer}>
                    <View style={styles.itemsScrollContainer}>
                        {item.items.slice(0, 3).map((food, index) => (
                            <View key={food.id} style={[styles.itemImageWrapper, { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -15 }]}>
                                <Image source={{ uri: food.image }} style={styles.itemImage} />
                                {food.quantity > 1 && (
                                    <View style={styles.quantityBadge}>
                                        <Text style={styles.quantityText}>{food.quantity}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        {item.items.length > 3 && (
                            <View style={styles.moreItemsBadge}>
                                <Text style={styles.moreItemsText}>+{item.items.length - 3}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalAmount}>{item.amount}</Text>
                    </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.detailsBtn}>
                        <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.actionBtnText}>
                            {item.status === OrderStatus.DELIVERED ? 'Reorder' : 'Track Order'}
                        </Text>
                        <MaterialIcons name="chevron-right" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
                <MaterialCommunityIcons name="basket-outline" size={60} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No {selectedTab === 'Ongoing' ? 'active' : 'previous'} orders</Text>
            <Text style={styles.emptySubtitle}>
                {selectedTab === 'Ongoing'
                    ? "You don't have any orders in progress right now."
                    : "Looks like you haven't placed any orders yet."}
            </Text>
            <TouchableOpacity style={styles.browseBtn}>
                <LinearGradient
                    colors={[COLORS.primary, '#9333EA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.browseBtnGradient}
                >
                    <Text style={styles.browseBtnText}>Start Shopping</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Professional Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Minta Fresh</Text>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <TouchableOpacity style={styles.searchBtn}>
                    <MaterialIcons name="search" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Custom Segmented Control (Tabs) */}
            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    {['Ongoing', 'Past Orders'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => handleTabChange(tab as any)}
                            style={[
                                styles.tabButton,
                                selectedTab === tab && styles.activeTabButton
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === tab && styles.activeTabText
                            ]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={uiOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && page === 1}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                onEndReached={hasMore ? loadMore : undefined}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={!isLoading ? renderEmpty : null}
                ListFooterComponent={() => (
                    isFetching && page > 1 ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : <View style={{ height: 40 }} />
                )}
            />

            <LoadingOverlay visible={isLoading && page === 1} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    searchBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTabButton: {
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    listContent: {
        padding: 20,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateTimeText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    itemsPreviewContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },
    itemsScrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImageWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.white,
        backgroundColor: '#F8FAFC',
        overflow: 'visible',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    quantityBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.white,
    },
    quantityText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
    moreItemsBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    moreItemsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    detailsBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    actionBtn: {
        flex: 1.5,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
        marginBottom: 30,
    },
    browseBtn: {
        width: '60%',
        height: 50,
        borderRadius: 15,
        overflow: 'hidden',
    },
    browseBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    browseBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});