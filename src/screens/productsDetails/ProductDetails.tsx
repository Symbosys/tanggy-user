import React, { useState, useRef } from 'react';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_HEIGHT = 0.45 * screenHeight;
const BOTTOM_BAR_HEIGHT = 80;

interface ProductDetailsScreenProps { }

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route, navigation }: any) => {
    const { product } = route.params;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const flatListRef = useRef<FlatList>(null);

    // Handle scroll event for image carousel
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndex(currentIndex);
    };

    const handleQuantityDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleQuantityIncrease = () => {
        setQuantity(quantity + 1);
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Top App Bar & Image Carousel Section */}
            <View style={styles.headerSection}>
                {/* Header Image with Carousel */}
                <View style={[styles.headerImage, { height: HEADER_HEIGHT }]}>
                    {/* Image Carousel */}
                    <FlatList
                        ref={flatListRef}
                        data={product.images}
                        renderItem={renderImageItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />

                    {/* Overlay Gradient */}
                    <View style={styles.overlayGradient} />

                    {/* Top App Bar */}
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

                    {/* Bestseller Badge - Only show if product is active and available */}
                    {product.isActive && product.isAvailable && (
                        <View style={styles.badgeContainer}>
                            <View style={styles.bestsellerBadge}>
                                <Text style={styles.bestsellerText}>BESTSELLER</Text>
                            </View>
                        </View>
                    )}

                    {/* Carousel Dots */}
                    {product.images.length > 1 && (
                        <View style={styles.carouselDots}>
                            {product.images.map((_: any, index: any) => (
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
                {/* Headline & Meta Text */}
                <View style={styles.headlineSection}>
                    <Text style={styles.title}>{product.name}</Text>
                    <Text style={styles.description}>{product.description}</Text>
                    <Text style={styles.category}>
                        Category: {product.category?.name || 'N/A'}
                        {product.subCategory?.name && ` • ${product.subCategory.name}`}
                    </Text>
                </View>

                {/* Price & Weight Selection Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>{parseToDecimal(product.sellingPrice).toFixed(2)}</Text>
                            <Text style={styles.originalPrice}>{parseToDecimal(product.marketPrice).toFixed(3)}</Text>
                        </View>
                        {product.marketPrice && (
                            <View style={styles.discountBadgeCard}>
                                <Text style={styles.discountText}>{calculateDiscount(product.marketPrice, product.sellingPrice)}% OFF</Text>
                            </View>
                        )}
                    </View>

                    {/* Weight and Pieces Info */}
                    <View style={styles.productMetaContainer}>
                        {product.weight && (
                            <View style={styles.metaItem}>
                                <Icon name="scale" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>Weight: {product.weight}</Text>
                            </View>
                        )}
                        {product.pieces && (
                            <View style={styles.metaItem}>
                                <Icon name="inventory" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>Pieces: {product.pieces}</Text>
                            </View>
                        )}
                    </View>

                    {/* Stock Status */}
                    <Text style={[
                        styles.stockText,
                        !product.isAvailable && styles.outOfStockText
                    ]}>
                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Text>
                </View>

                {/* Freshness Tags */}
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

                {/* Product Description */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>Product Description</Text>
                    <Text style={styles.descriptionBody}>
                        {product.description || 'Our premium quality product is sourced from local farms and processed with the highest hygiene standards. Perfect for all your cooking needs.'}
                    </Text>
                </View>

                {/* Preparation & Storage */}
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
            {product.isAvailable && (
                <View style={styles.bottomBar}>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={handleQuantityDecrease}
                        >
                            <Text style={styles.quantityText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={handleQuantityIncrease}
                        >
                            <Text style={styles.quantityText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addToCartButton}>
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
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
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    starLabel: {
        width: 16,
        fontSize: 12,
    },
    barContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 3,
    },
    barFill85: {
        width: '85%',
        backgroundColor: '#22c55e',
    },
    barFill10: {
        width: '10%',
        backgroundColor: '#22c55e',
    },
    barFill3: {
        width: '3%',
        backgroundColor: '#eab308',
    },
    barFill1: {
        width: '1%',
        backgroundColor: '#f97316',
    },
    reviewSample: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginTop: 4,
        lineHeight: 20,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    quantity: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        minWidth: 20,
        textAlign: 'center',
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
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
});