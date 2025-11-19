import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import api from '../../api/api';
import { Order, OrderStatus } from '../../types/order.type';
import { LoadingOverlay } from '../../components/ui/loader/LoaderOverLay';

interface OrderItemUI {
    id: string;
    restaurant: string;
    date: string;
    amount: string;
    status: OrderStatus;
    statusColor: string;
    items: Array<{
        id: string;
        name: string;
        image: string;
    }>;
}

const ONGOING_STATUSES: OrderStatus[] = [
    OrderStatus.PLACED,
    OrderStatus.VENDOR_PENDING,
    OrderStatus.VENDOR_ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.DELIVERY_PENDING,
    OrderStatus.OUT_FOR_DELIVERY,
];

const PAST_STATUSES: OrderStatus[] = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
    OrderStatus.DISPUTED,
];

const STATUS_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.PLACED]: COLORS.primary,
    [OrderStatus.VENDOR_PENDING]: COLORS.warning,
    [OrderStatus.VENDOR_ACCEPTED]: COLORS.accent,
    [OrderStatus.PREPARING]: "#4CAF50",
    [OrderStatus.READY_FOR_PICKUP]: COLORS.success,
    [OrderStatus.DELIVERY_PENDING]: COLORS.warning,
    [OrderStatus.OUT_FOR_DELIVERY]: COLORS.primary,
    [OrderStatus.DELIVERED]: '#4CAF50',
    [OrderStatus.CANCELLED]: '#EF5350',
    [OrderStatus.REFUNDED]: '#4CAF50',
    [OrderStatus.DISPUTED]: '#FF9800',
};

export default function AllOrdersScreen() {
    const [selectedTab, setSelectedTab] = useState<'Ongoing' | 'Past Orders'>('Past Orders');
    const [ongoingOrders, setOngoingOrders] = useState<OrderItemUI[]>([]);
    const [pastOrders, setPastOrders] = useState<OrderItemUI[]>([]);
    const [ongoingPage, setOngoingPage] = useState(1);
    const [pastPage, setPastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreOngoing, setHasMoreOngoing] = useState(true);
    const [hasMorePast, setHasMorePast] = useState(true);
    const LIMIT = 10;
    const isMountedRef = useRef(true);

    const fetchOrders = useCallback(async (page: number, isOngoing: boolean, isRefresh = false) => {
        if (loading && !isRefresh) return;
        setLoading(true);
        if (isRefresh) setRefreshing(true);

        try {
            const response = await api.get('/user/order/all', {
                params: {
                    limit: LIMIT,
                    page,
                },
            });

            const backendOrders: Order[] = response.data.orders;
            const totalOrder = response.data.totalOrder;

            const uiOrders: OrderItemUI[] = backendOrders?.filter((order: Order) => {
                    const status = order.status;
                    if (isOngoing) {
                        return ONGOING_STATUSES.includes(status);
                    } else {
                        return PAST_STATUSES.includes(status);
                    }
                })
                .map((order: Order) => ({
                    id: order.id.toString(),
                    restaurant: order.vendorBroadcasts?.[0]?.vendor?.name || 'Unknown Vendor', // Assuming vendor included; adjust if needed
                    date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    amount: `₹${order.paidAmount?.toFixed(2) || order.subtotal.toFixed(2)}`,
                    status: order.status,
                    statusColor: STATUS_COLORS[order.status] || COLORS.highlight,
                    items: order.items?.map((item: any) => ({
                        id: item.id.toString(),
                        name: `${item.quantity}x ${item.product?.name || 'Unknown Item'}`,
                        image: item.product?.images?.[0]?.image?.url || '',
                    })) || [],
                }));

            if (isRefresh) {
                if (isOngoing) {
                    setOngoingOrders(uiOrders);
                    setOngoingPage(1);
                    setHasMoreOngoing(backendOrders.length === LIMIT);
                } else {
                    setPastOrders(uiOrders);
                    setPastPage(1);
                    setHasMorePast(backendOrders?.length === LIMIT);
                }
            } else {
                if (isOngoing) {
                    setOngoingOrders(prev => [...prev, ...uiOrders]);
                    setHasMoreOngoing(backendOrders.length === LIMIT);
                } else {
                    setPastOrders(prev => [...prev, ...uiOrders]);
                    setHasMorePast(backendOrders.length === LIMIT);
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                if (isRefresh) setRefreshing(false);
            }
        }
    }, []); // Removed loading from deps to prevent recreation loop

    const onRefresh = useCallback(() => {
        fetchOrders(selectedTab === 'Ongoing' ? ongoingPage : pastPage, selectedTab === 'Ongoing', true);
    }, [selectedTab, ongoingPage, pastPage, fetchOrders]);

    const loadMore = useCallback(() => {
        if (!loading && (selectedTab === 'Ongoing' ? hasMoreOngoing : hasMorePast)) {
            const nextPage = selectedTab === 'Ongoing' ? ongoingPage + 1 : pastPage + 1;
            fetchOrders(nextPage, selectedTab === 'Ongoing', false);
            if (selectedTab === 'Ongoing') {
                setOngoingPage(nextPage);
            } else {
                setPastPage(nextPage);
            }
        }
    }, [loading, selectedTab, hasMoreOngoing, hasMorePast, ongoingPage, pastPage, fetchOrders]);

    const handleTabChange = useCallback((tab: 'Ongoing' | 'Past Orders') => {
        setSelectedTab(tab);
    }, []);

    const data = selectedTab === 'Ongoing' ? ongoingOrders : pastOrders;
    const hasMore = selectedTab === 'Ongoing' ? hasMoreOngoing : hasMorePast;

    const renderOrderCard = useCallback(({ item }: { item: OrderItemUI }) => (
        <View
            style={{
                backgroundColor: COLORS.white,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 5,
                marginBottom: 16,
                elevation: 3,
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
                    <Image
                        source={{ uri: item.items[0]?.image }}
                        style={{ width: 56, height: 56, borderRadius: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.textPrimary }}>
                            {item.restaurant}
                        </Text>
                        <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                            {item.date} • {item.amount}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        backgroundColor: item.statusColor + '20',
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                    }}
                >
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.statusColor }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Items */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 12, paddingTop: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', marginBottom: 6, color: COLORS.textPrimary }}>
                    Items ordered:
                </Text>
                {item.items.map((food: any) => (
                    <View key={food.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Image
                            source={{ uri: food.image }}
                            style={{ width: 40, height: 40, borderRadius: 8, marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{food.name}</Text>
                    </View>
                ))}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 12, paddingTop: 10 }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.secondary,
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Rate Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.primary,
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: COLORS.white }}>Reorder</Text>
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderFooter = useCallback(() => {
        if (!loading) return null;
        return null; // Removed ActivityIndicator as overlay handles loading
    }, [loading]);

    const renderEmpty = useCallback(() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' }}>
                No {selectedTab.toLowerCase().replace('past ', '')} orders yet
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>
                Make your first order to see it here
            </Text>
        </View>
    ), [selectedTab]);

    // Fixed useEffect to prevent infinite calls - only fetch if data is empty for the current tab
    useEffect(() => {
        if (selectedTab === 'Ongoing' && ongoingOrders.length === 0) {
            fetchOrders(1, true, true);
        } else if (selectedTab === 'Past Orders' && pastOrders.length === 0) {
            fetchOrders(1, false, true);
        }
    }, [selectedTab]); // Only depend on selectedTab, and check if data is empty

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <View style={{ padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary }}>Your Orders</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <MaterialIcons name="search" size={24} color={COLORS.textPrimary} />
                    <MaterialIcons name="filter-list" size={24} color={COLORS.textPrimary} />
                </View>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                {['Ongoing', 'Past Orders'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => handleTabChange(tab as 'Ongoing' | 'Past Orders')}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            paddingVertical: 10,
                            borderBottomWidth: 3,
                            borderBottomColor: selectedTab === tab ? COLORS.primary : 'transparent',
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: selectedTab === tab ? 'bold' : '800',
                                color: selectedTab === tab ? COLORS.primary : COLORS.muted,
                            }}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderCard}
                contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={hasMore ? loadMore : undefined}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />
        </SafeAreaView>
    );
}