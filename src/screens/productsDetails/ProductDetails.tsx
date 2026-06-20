import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { COLORS } from '../../theme/theme';
import { calculateDiscount, ErrorMessage, parseToDecimal } from '../../utils/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_HEIGHT = 0.45 * screenHeight;
const BOTTOM_BAR_HEIGHT = 80;

interface ProductDetailsScreenProps { }

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route, navigation }: any) => {
    const { product: initialProduct } = route.params;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    console.log({ initialProduct })

    const { isAuthenticated } = useAuth();
    const { showAlert } = useAlertStore();
    const { addToCart, getQuantity, incrementQuantity, decrementQuantity } = useCartStore();

    // Get current cart quantity from Zustand store
    const cartQuantity = getQuantity(initialProduct.id);
    const insets = useSafeAreaInsets();

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
                await addToCart(initialProduct.id, 1, initialProduct);
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
        <View style={styles.container}>
            {/* Fixed Image Carousel at Top */}
            <View style={styles.fixedImageContainer}>
                <Carousel
                    width={screenWidth}
                    height={HEADER_HEIGHT}
                    data={initialProduct.images}
                    autoPlay={initialProduct.images.length > 1}
                    autoPlayInterval={3000}
                    scrollAnimationDuration={800}
                    onSnapToItem={(index) => setCurrentImageIndex(index)}
                    renderItem={({ item }: any) => (
                        <Image
                            source={{ uri: item.image.url }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    )}
                />

                {/* Top Navigation Bar */}
                <SafeAreaView style={styles.topBarSafe}>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {initialProduct.isActive && initialProduct.isAvailable && (
                    <View style={[styles.badgeContainer, { top: insets.top + 60 }]}>
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

            {/* Scrollable Content Sheet */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Spacer to show image behind */}
                <View style={{ height: HEADER_HEIGHT - 40 }} />

                {/* Details Sheet */}
                <View style={styles.detailsSheet}>
                    {/* Sheet Handle */}
                    <View style={styles.sheetHandle} />

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

                    {/* Extra padding for bottom bar */}
                    <View style={{ height: BOTTOM_BAR_HEIGHT + 40 }} />
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            {initialProduct.isAvailable && (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    {cartQuantity === 0 ? (
                        <TouchableOpacity style={styles.addToCartButtonFull} onPress={handleAddToCart}>
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.bottomControlsRow}>
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

                            <TouchableOpacity
                                style={styles.viewCartSmallButton}
                                onPress={() => navigation.navigate('Cart')}
                            >
                                <Text style={styles.viewCartSmallText}>View Cart</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    fixedImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        backgroundColor: '#000',
    },
    imageSlide: {
        height: '100%',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    topBarSafe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    badgeContainer: {
        position: 'absolute',
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
        bottom: 50,
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
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    detailsSheet: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 16,
        minHeight: screenHeight - HEADER_HEIGHT + 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
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
        paddingTop: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
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
    bottomControlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    viewCartButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    viewCartText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    viewCartSmallButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    viewCartSmallText: {
        fontSize: 14,
        fontWeight: '800',
        color: 'white',
    },
});