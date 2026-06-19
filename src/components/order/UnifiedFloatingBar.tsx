import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { useOrders } from '../../api/hooks/useOrder';
import { useCartStore } from '../../store/cart';
import { COLORS } from '../../theme/theme';
import { OrderStatus } from '../../types/order.type';
import { parseToDecimal } from '../../utils/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 85 : 70;
const SLIDE_DISTANCE = 80;
const BUTTON_GRADIENT = ['#6A0DAD', '#D8B4FF'];

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    [OrderStatus.PLACED]: { color: '#6366F1', icon: 'package-variant-closed', label: 'Order Placed' },
    [OrderStatus.VENDOR_PENDING]: { color: '#F59E0B', icon: 'store-search', label: 'Finding Store' },
    [OrderStatus.VENDOR_ACCEPTED]: { color: '#10B981', icon: 'store-check', label: 'Store Accepted' },
    [OrderStatus.PREPARING]: { color: '#8B5CF6', icon: 'pot-steam', label: 'Food Preparing' },
    [OrderStatus.READY_FOR_PICKUP]: { color: '#06B6D4', icon: 'bag-checked', label: 'Ready for Pickup' },
    [OrderStatus.DELIVERY_PENDING]: { color: '#F59E0B', icon: 'moped-electric', label: 'Assigning Rider' },
    [OrderStatus.OUT_FOR_DELIVERY]: { color: '#3B82F6', icon: 'moped', label: 'Out for Delivery' },
};

interface UnifiedFloatingBarProps {
    hasBottomTab?: boolean;
    onCartPress: () => void;
}

// Separate component for the Cart slide to isolate local animation state
const CartSlide = ({ totalItems, subTotal, onCartPress, clearCart }: any) => {
    const [isSlid, setIsSlid] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleToggleSlide = () => {
        if (isSlid) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 50,
            }).start(() => setIsSlid(false));
        } else {
            setIsSlid(true);
            Animated.spring(slideAnim, {
                toValue: -SLIDE_DISTANCE,
                useNativeDriver: true,
                friction: 8,
                tension: 50,
            }).start();
        }
    };

    const handleRemoveCart = async () => {
        await clearCart();
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 50,
        }).start(() => setIsSlid(false));
    };

    return (
        <View style={styles.slideWrapper}>
            {/* Remove Text - Only visible when slid */}
            {isSlid && (
                <TouchableOpacity
                    style={styles.removeContainer}
                    onPress={handleRemoveCart}
                    activeOpacity={0.7}
                >
                    <Text style={styles.removeText}>
                        <MIcon name="delete" size={24} color={COLORS.white} />
                    </Text>
                </TouchableOpacity>
            )}

            {/* Sliding Cart Bar */}
            <Animated.View style={[styles.slidingContainer, { transform: [{ translateX: slideAnim }] }]}>
                <LinearGradient
                    colors={['#000000', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.viewCartBar}
                >
                    <View style={styles.cartInfo}>
                        <Text style={styles.viewCartItems}>
                            {totalItems} {totalItems > 1 ? 'Items' : 'Item'} | ₹{parseToDecimal(subTotal).toFixed(2)}
                        </Text>
                        <Text style={styles.viewCartNote}>Extra charges may apply</Text>
                    </View>
                    <TouchableOpacity onPress={onCartPress}>
                        <LinearGradient
                            colors={BUTTON_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.viewCartButton}
                        >
                            <Text style={styles.viewCartText}>View Cart</Text>
                            <MIcon name="arrow-forward" size={20} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* X Button on the RIGHT side */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleToggleSlide}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MIcon name="close" size={18} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

const OrderSlide = ({ item, navigation }: any) => {
    const config = STATUS_CONFIG[item.status] || { color: COLORS.primary, icon: 'package-variant', label: item.status };
    const firstItem = item.items?.[0];
    const otherItemsCount = (item.items?.length || 0) - 1;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.slideContainer}
            onPress={() => navigation.navigate('OrderTracking', { id: item.id })}
        >
            <LinearGradient
                colors={['#1E293B', '#0F172A']}
                style={styles.cardGradient}
            >
                <View style={styles.contentContainer}>
                    {/* Status Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                        <MCIcon name={config.icon} size={24} color={config.color} />
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
                    <View
                        style={styles.trackButton}
                    >
                        <Text style={styles.trackText}>Track</Text>
                        <MCIcon name="chevron-right" size={18} color={COLORS.white} />
                    </View>
                </View>

                {/* Progress Bar (Decorative) */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { backgroundColor: config.color, width: '60%' }]} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default function UnifiedFloatingBar({
    hasBottomTab = false,
    onCartPress,
}: UnifiedFloatingBarProps) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [activeIndex, setActiveIndex] = useState(0);

    const { data: orderData } = useOrders({
        page: 1,
        limit: 10,
        statusType: 'ongoing',
    });

    const ongoingOrders = orderData?.orders || [];
    const { totalItems: totalCartItems, subtotal: subTotal, clearCart } = useCartStore();

    // onViewableItemsChanged tracks current index to update indicator dot
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    // Combine slides
    const slides: any[] = [...ongoingOrders];
    if (totalCartItems > 0) {
        slides.push({
            isCart: true,
            totalItems: totalCartItems,
            subTotal: subTotal,
        });
    }

    if (slides.length === 0) return null;

    const bottomPosition = hasBottomTab
        ? (Platform.OS === 'ios' ? 24 : 10)
        : (Platform.OS === 'ios' ? Math.max(insets.bottom, 12) + 8 : 12);

    return (
        <View style={[styles.container, { bottom: bottomPosition }]}>
            <FlatList
                data={slides}
                renderItem={({ item }) => {
                    if (item.isCart) {
                        return (
                            <View style={styles.slideContainer}>
                                <CartSlide
                                    totalItems={item.totalItems}
                                    subTotal={item.subTotal}
                                    onCartPress={onCartPress}
                                    clearCart={clearCart}
                                />
                            </View>
                        );
                    }
                    return <OrderSlide item={item} navigation={navigation} />;
                }}
                keyExtractor={(item, index) => (item.isCart ? 'cart' : item.id.toString())}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            {slides.length > 1 && (
                <View style={styles.pagination}>
                    {slides.map((_: any, index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeIndex && styles.activeDot,
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
    slideContainer: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 16,
        height: 72,
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
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    activeDot: {
        width: 16,
        backgroundColor: COLORS.primary,
    },
    // Cart Slide Specific Styles
    slideWrapper: {
        width: SCREEN_WIDTH - 32,
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    removeContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: COLORS.primary,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    removeText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    slidingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
    },
    viewCartBar: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
    },
    cartInfo: {
        flex: 1,
    },
    viewCartItems: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    viewCartNote: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
    },
    viewCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 40,
    },
    viewCartText: {
        color: COLORS.white,
        fontWeight: '700',
        marginRight: 6,
        fontSize: 13,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
