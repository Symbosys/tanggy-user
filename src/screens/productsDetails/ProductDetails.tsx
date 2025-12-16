import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateDiscount, parseToDecimal } from '../../utils/utils';
import { useAuth } from '../../context/AuthContext';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import Toast from 'react-native-toast-message';
import { ErrorMessage } from '../../utils/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_HEIGHT = 0.45 * screenHeight;
const BOTTOM_BAR_HEIGHT = 80;

interface ProductDetailsScreenProps {}

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route, navigation }: any) => {
    const { product: initialProduct } = route.params;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    console.log({initialProduct})

    const { isAuthenticated } = useAuth();
    const { showAlert } = useAlertStore();
    const { addToCart, getQuantity, incrementQuantity, decrementQuantity } = useCartStore();

    // Get current cart quantity from Zustand store
    const cartQuantity = getQuantity(initialProduct.id);

    // Handle scroll event for image carousel
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndex(currentIndex);
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            showAlert({
                title: 'Login Required',
                message: 'You need to log in to add this product to your cart.',
                confirmText: 'Login',
                cancelText: 'Cancel',
                onConfirm: () => navigation.navigate('Login'),
            });
            return;
        }

        try {
            if (cartQuantity === 0) {
                // First time adding: set to 1
                await addToCart(initialProduct.id, 1);
                Toast.show({
                    type: 'success',
                    text1: 'Added to cart!',
                });
            } else {
                // Already in cart: increment by 1
                await incrementQuantity(initialProduct);
                Toast.show({
                    type: 'success',
                    text1: '1 more added to cart!',
                });
            }
        } catch (error) {
            ErrorMessage(error as any);
        }
    };

    const handleIncrement = async () => {
        if (!isAuthenticated) {
            showAlert({
                title: 'Login Required',
                message: 'You need to log in to update your cart.',
                confirmText: 'Login',
                cancelText: 'Cancel',
                onConfirm: () => navigation.navigate('Login'),
            });
            return;
        }

        try {
            await incrementQuantity(initialProduct);
        } catch (error) {
            ErrorMessage(error as any);
        }
    };

    const handleDecrement = async () => {
        if (!isAuthenticated) return;

        try {
            await decrementQuantity(initialProduct);
            // If quantity becomes 0 after decrement, the UI will automatically update
        } catch (error) {
            ErrorMessage(error as any);
        }
    };

    const renderImageItem = ({ item }: any) => (
        <View style={[styles.imageSlide, { width: screenWidth }]}>
            <Image
                source={{ uri: item.image.url }}
                style={styles.productImage}
                resizeMode="cover"
            />
        </View>
    );

    const currentPrice = parseToDecimal(initialProduct.sellingPrice).toFixed(2);
    const originalPrice = initialProduct.marketPrice ? parseToDecimal(initialProduct.marketPrice).toFixed(2) : null;
    const hasDiscount = !!initialProduct.marketPrice && parseToDecimal(initialProduct.marketPrice) > parseToDecimal(initialProduct.sellingPrice);

    return (
        <SafeAreaView style={styles.container}>
            {/* Top App Bar & Image Carousel Section */}
            <View style={styles.headerSection}>
                <View style={[styles.headerImage, { height: HEADER_HEIGHT }]}>
                    <FlatList
                        ref={flatListRef}
                        data={initialProduct.images}
                        renderItem={renderImageItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />

                    <View style={styles.overlayGradient} />

                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.rightIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="share" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {initialProduct.isActive && initialProduct.isAvailable && (
                        <View style={styles.badgeContainer}>
                            <View style={styles.bestsellerBadge}>
                                <Text style={styles.bestsellerText}>BESTSELLER</Text>
                            </View>
                        </View>
                    )}

                    {initialProduct.images.length > 1 && (
                        <View style={styles.carouselDots}>
                            {initialProduct.images.map((_: any, index: any) => (
                                <View
                                    key={index}
                                    style={
                                        index === currentImageIndex
                                            ? styles.activeDot
                                            : styles.inactiveDot
                                    }
                                />
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* Product Details Section */}
            <ScrollView
                style={styles.detailsSection}
                contentContainerStyle={styles.detailsContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={styles.title}>{initialProduct.name}</Text>
                    <Text style={styles.description}>{initialProduct.description}</Text>
                    <Text style={styles.category}>
                        Category: {initialProduct.category?.name || 'N/A'}
                        {initialProduct.subCategory?.name && ` • ${initialProduct.subCategory.name}`}
                    </Text>
                </View>

                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        {originalPrice ? (
                            <View style={styles.priceContainer}>
                                <Text style={styles.currentPrice}>₹{currentPrice}</Text>
                                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                            </View>
                        ) : (
                            <Text style={styles.currentPrice}>₹{currentPrice}</Text>
                        )}
                        {hasDiscount && (
                            <View style={styles.discountBadgeCard}>
                                <Text style={styles.discountText}>
                                    {calculateDiscount(initialProduct.marketPrice, initialProduct.sellingPrice)}% OFF
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.productMetaContainer}>
                        {initialProduct.weight && (
                            <View style={styles.metaItem}>
                                <Icon name="scale" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>Weight: {initialProduct.weight}</Text>
                            </View>
                        )}
                        {initialProduct.pieces && (
                            <View style={styles.metaItem}>
                                <Icon name="inventory" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>Pieces: {initialProduct.pieces}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[
                        styles.stockText,
                        !initialProduct.isAvailable && styles.outOfStockText
                    ]}>
                        {initialProduct.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Text>
                </View>

                <View style={styles.freshnessGrid}>
                    <View style={styles.freshnessItem}>
                        <Icon name="ac-unit" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>Chilled, Never Frozen</Text>
                    </View>
                    <View style={styles.freshnessItem}>
                        <Icon name="verified" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>100% Fresh Cut</Text>
                    </View>
                    <View style={styles.freshnessItem}>
                        <Icon name="science" size={24} color={COLORS.primary} />
                        <Text style={styles.freshnessText}>Antibiotic-Free</Text>
                    </View>
                </View>

                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>Product Description</Text>
                    <Text style={styles.descriptionBody}>
                        {initialProduct.description || 'Our premium quality product is sourced from local farms and processed with the highest hygiene standards. Perfect for all your cooking needs.'}
                    </Text>
                </View>

                <View style={styles.tipsSection}>
                    <View style={styles.tipCard}>
                        <View style={styles.tipHeader}>
                            <Icon name="soup-kitchen" size={24} color={COLORS.primary} style={styles.tipIcon} />
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Preparation Tips</Text>
                                <Text style={styles.tipBody}>Rinse lightly with cold water before cooking. Pat dry for better searing and flavor absorption.</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.tipCard}>
                        <View style={styles.tipHeader}>
                            <Icon name="thermostat" size={24} color={COLORS.primary} style={styles.tipIcon} />
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Storage Tips</Text>
                                <Text style={styles.tipBody}>Store in an airtight container and refrigerate below 4°C. Consume within 2 days for best freshness.</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            {initialProduct.isAvailable && (
                <View style={styles.bottomBar}>
                    {cartQuantity === 0 ? (
                        <TouchableOpacity style={styles.addToCartButtonFull} onPress={handleAddToCart}>
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityControlContainer}>
                            <TouchableOpacity
                                style={styles.quantityButtonLarge}
                                onPress={handleDecrement}
                            >
                                <Icon name="remove" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.quantityLarge}>{cartQuantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButtonLarge}
                                onPress={handleIncrement}
                            >
                                <Icon name="add" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerSection: {
        position: 'relative',
    },
    headerImage: {
        backgroundColor: 'black',
        justifyContent: 'space-between',
    },
    imageSlide: {
        height: '100%',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    overlayGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: 80,
        left: 16,
    },
    bestsellerBadge: {
        backgroundColor: '#ec4899',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    bestsellerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
    },
    carouselDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    activeDot: {
        width: 24,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    inactiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    detailsSection: {
        flex: 1,
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: COLORS.background,
    },
    detailsContent: {
        padding: 24,
        paddingTop: 24,
        paddingBottom: BOTTOM_BAR_HEIGHT + 24,
    },
    headlineSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 28,
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 4,
        lineHeight: 24,
    },
    category: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '800',
        marginTop: 8,
        textTransform: 'capitalize',
    },
    priceCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        marginBottom: 16,
    },
    priceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    currentPrice: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    originalPrice: {
        fontSize: 18,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    },
    discountBadgeCard: {
        backgroundColor: 'rgba(135, 25, 198, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },
    productMetaContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#16a34a',
    },
    outOfStockText: {
        color: '#ef4444',
    },
    freshnessGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    freshnessItem: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    freshnessText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    descriptionCard: {
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    descriptionBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    tipsSection: {
        gap: 16,
        marginBottom: 16,
    },
    tipCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tipHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    tipIcon: {
        marginTop: 4,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    tipBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    addToCartButtonFull: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    quantityControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    quantityButtonLarge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityLarge: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        minWidth: 30,
        textAlign: 'center',
    },
});