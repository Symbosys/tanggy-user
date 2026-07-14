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
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../../api/hooks/useOrder';
import { COLORS } from '../../theme/theme';
import { OrderStatus } from '../../types/order.type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    [OrderStatus.PLACED]: { color: '#818CF8', label: 'Order Placed' },
    [OrderStatus.VENDOR_PENDING]: { color: '#FBBF24', label: 'Finding Store' },
    [OrderStatus.VENDOR_ACCEPTED]: { color: '#34D399', label: 'Store Confirmed' },
    [OrderStatus.PREPARING]: { color: '#A78BFA', label: 'Store Preparing' },
    [OrderStatus.READY_FOR_PICKUP]: { color: '#22D3EE', label: 'Ready for Pickup' },
    [OrderStatus.DELIVERY_PENDING]: { color: '#FBBF24', label: 'Assigning Rider' },
    [OrderStatus.OUT_FOR_DELIVERY]: { color: '#60A5FA', label: 'Out for Delivery' },
};

const LOTTIE_CONFIG: Record<string, any> = {
    [OrderStatus.VENDOR_PENDING]: require('../../assets/order/ongoing/finding-shop.json'),
    [OrderStatus.VENDOR_ACCEPTED]: require('../../assets/order/ongoing/preparing.json'),
    [OrderStatus.PREPARING]: require('../../assets/order/ongoing/preparing.json'),
    [OrderStatus.READY_FOR_PICKUP]: require('../../assets/order/ongoing/ready-for-picup.json'),
    [OrderStatus.DELIVERY_PENDING]: require('../../assets/order/ongoing/ready-for-picup.json'),
    [OrderStatus.OUT_FOR_DELIVERY]: require('../../assets/order/ongoing/out_for_delivery.json'),
    [OrderStatus.DELIVERED]: require('../../assets/order/ongoing/Delivered.json'),
};

const getProgressPercent = (status: string): string => {
    switch (status) {
        case OrderStatus.PLACED:
            return '15%';
        case OrderStatus.VENDOR_PENDING:
            return '30%';
        case OrderStatus.VENDOR_ACCEPTED:
            return '45%';
        case OrderStatus.PREPARING:
            return '60%';
        case OrderStatus.READY_FOR_PICKUP:
        case OrderStatus.DELIVERY_PENDING:
            return '75%';
        case OrderStatus.OUT_FOR_DELIVERY:
            return '90%';
        default:
            return '50%';
    }
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
        const config = STATUS_CONFIG[item.status] || { color: '#A78BFA', label: item.status };
        const firstItem = item.items?.[0];
        const otherItemsCount = (item.items?.length || 0) - 1;
        const progressWidth = getProgressPercent(item.status);
        
        const isPlaced = item.status === OrderStatus.PLACED;
        const lottieSource = LOTTIE_CONFIG[item.status] || require('../../assets/order/ongoing/preparing.json');

        return (
            <TouchableOpacity
                activeOpacity={0.95}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderTracking', { id: item.id })}
            >
                <LinearGradient
                    colors={['rgba(146, 53, 208, 0.96)', 'rgba(76, 29, 149, 0.98)']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.contentContainer}>
                        {/* Status Icon or Lottie */}
                        {isPlaced ? (
                            <View style={styles.iconContainer}>
                                <Icon name="package-variant-closed" size={22} color="#FFFFFF" />
                            </View>
                        ) : (
                            <View style={styles.lottieContainer}>
                                <LottieView
                                    source={lottieSource}
                                    autoPlay
                                    loop
                                    style={styles.lottie}
                                />
                            </View>
                        )}

                        {/* Order Info */}
                        <View style={styles.textContainer}>
                            <Text style={styles.statusLabel}>{config.label}</Text>
                            <Text style={styles.itemInfo} numberOfLines={1}>
                                {firstItem?.product?.name || 'Fresh item'}
                                {otherItemsCount > 0 ? ` + ${otherItemsCount} more` : ''}
                            </Text>
                        </View>

                        {/* Track Button */}
                        <TouchableOpacity
                            style={styles.trackButton}
                            onPress={() => navigation.navigate('OrderTracking', { id: item.id })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.trackText}>Track</Text>
                            <Icon name="chevron-right" size={14} color="#9235D0" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar (Modernized) */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: progressWidth as any }]} />
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
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        height: 80,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
        // Shadow (iOS glow)
        shadowColor: '#9235D0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        // Elevation (Android)
        elevation: 8,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lottieContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    lottie: {
        width: 44,
        height: 44,
    },
    textContainer: {
        flex: 1,
    },
    statusLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    itemInfo: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 11,
        fontWeight: '600',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    trackText: {
        color: '#9235D0',
        fontSize: 12,
        fontWeight: '800',
        marginRight: 3,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    activeDot: {
        width: 18,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9235D0',
    },
});
