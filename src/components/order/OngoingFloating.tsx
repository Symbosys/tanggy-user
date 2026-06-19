import { useNavigation } from '@react-navigation/native';
import React, { useRef } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../../api/hooks/useOrder';
import { COLORS } from '../../theme/theme';
import { OrderStatus } from '../../types/order.type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    [OrderStatus.PLACED]: { color: '#6366F1', icon: 'package-variant-closed', label: 'Order Placed' },
    [OrderStatus.VENDOR_PENDING]: { color: '#F59E0B', icon: 'store-search', label: 'Finding Store' },
    [OrderStatus.VENDOR_ACCEPTED]: { color: '#10B981', icon: 'store-check', label: 'Store Accepted' },
    [OrderStatus.PREPARING]: { color: '#8B5CF6', icon: 'pot-steam', label: 'Food Preparing' },
    [OrderStatus.READY_FOR_PICKUP]: { color: '#06B6D4', icon: 'bag-checked', label: 'Ready for Pickup' },
    [OrderStatus.DELIVERY_PENDING]: { color: '#F59E0B', icon: 'moped-electric', label: 'Assigning Rider' },
    [OrderStatus.OUT_FOR_DELIVERY]: { color: '#3B82F6', icon: 'moped', label: 'Out for Delivery' },
};

export default function OngoingFloating() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [activeIndex, setActiveIndex] = React.useState(0);

    const { data: orderData } = useOrders({
        page: 1,
        limit: 10,
        statusType: 'ongoing',
    });

    const ongoingOrders = orderData?.orders || [];

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    if (ongoingOrders.length === 0) return null;

    const renderOrderItem = ({ item }: { item: any }) => {
        const config = STATUS_CONFIG[item.status] || { color: COLORS.primary, icon: 'package-variant', label: item.status };
        const firstItem = item.items?.[0];
        const otherItemsCount = (item.items?.length || 0) - 1;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderTracking', { id: item.id })}
            >
                <LinearGradient
                    colors={['#1E293B', '#0F172A']}
                    style={styles.cardGradient}
                >
                    <View style={styles.contentContainer}>
                        {/* Status Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                            <Icon name={config.icon} size={24} color={config.color} />
                        </View>

                        {/* Order Info */}
                        <View style={styles.textContainer}>
                            <Text style={styles.statusLabel}>{config.label}</Text>
                            <Text style={styles.itemInfo} numberOfLines={1}>
                                {firstItem?.product?.name || 'Item'}
                                {otherItemsCount > 0 ? ` + ${otherItemsCount} more` : ''}
                            </Text>
                        </View>

                        {/* Track Button */}
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => navigation.navigate('OrderTracking', { id: item.id })}
                        >
                            <Text style={styles.trackText}>Track</Text>
                            <Icon name="chevron-right" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar (Decorative) */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { backgroundColor: config.color, width: '60%' }]} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { bottom: BOTTOM_TAB_HEIGHT + 8 }]}>
            <FlatList
                data={ongoingOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            {ongoingOrders.length > 1 && (
                <View style={styles.pagination}>
                    {ongoingOrders.map((_: any, index: any) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeIndex && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    listContent: {
        paddingHorizontal: 0,
    },
    orderCard: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 16,
    },
    cardGradient: {
        borderRadius: 16,
        padding: 12,
        height: 72,
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    statusLabel: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    itemInfo: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    trackText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        marginRight: 2,
    },
    progressBarBg: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 6,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    activeDot: {
        width: 16,
        backgroundColor: COLORS.primary,
    },
});
