// ProductCard.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Product } from '../../../types/product.type';
import { AppNavigation } from '../../../types/type';
import { calculateDiscount, parseToDecimal } from '../../../utils/utils';
import { COLORS } from '../../../theme/theme';

interface ProductCardProps {
    product: Product;
    navigation: AppNavigation['navigation'];
    handleNavigateToDetails: (product: Product) => void;
    handleAddToCart: (productId: number, quantity?: number) => Promise<void>;
    isAuthenticated: boolean;
    style?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    navigation,
    handleNavigateToDetails,
    handleAddToCart,
    isAuthenticated,
    style,
}) => {
    const discount = calculateDiscount(product.marketPrice, product.sellingPrice);
    const piecesText = Number(product.pieces) === 1 ? 'piece' : 'pieces';
    const description = `${product.weight}g • ${product.pieces} ${piecesText}`;
    const originalPrice = parseToDecimal(product.marketPrice).toFixed(2);
    const discountedPrice = parseToDecimal(product.sellingPrice).toFixed(2);
    const unavailable = !product.isAvailable;
    const image = product.images?.[0]?.image.url || '';
    const title = product.name;
    const discountStr = discount > 0 ? `${discount}% OFF` : '';

    return (
        <TouchableOpacity
            style={styles.cardTouchable}
            onPress={() => handleNavigateToDetails(product)}
            disabled={unavailable}
            activeOpacity={0.95}
        >
            <View style={[styles.card, style]}>
                {discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discountStr}</Text>
                    </View>
                )}
                <View style={styles.imageContainer}>
                    <ImageBackground
                        source={{ uri: image }}
                        style={styles.image}
                        imageStyle={unavailable ? { opacity: 0.6 } : undefined}
                        resizeMode="cover"
                    >
                        {unavailable && (
                            <View style={styles.unavailableOverlay}>
                                <Text style={styles.unavailableTitle}>Unavailable</Text>
                                <Text style={styles.unavailableSubtitle}>
                                    Not available in your area
                                </Text>
                            </View>
                        )}
                    </ImageBackground>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                    <View style={styles.priceContainer}>
                        <Text
                            style={[
                                styles.discountedPrice,
                                unavailable && { color: COLORS.textSecondary },
                            ]}
                        >
                            {discountedPrice}
                        </Text>
                        {product.marketPrice && (
                            <Text style={styles.originalPrice}>{originalPrice}</Text>
                        )}
                    </View>
                </View>
                {unavailable ? (
                    <TouchableOpacity style={styles.unavailableButton} disabled>
                        <Text style={styles.unavailableButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(Number(product.id), 1);
                        }}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#b58ff0']}
                            style={styles.addButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardTouchable: {
        flex: 1,
    },
    card: {
        flex: 1,
        flexDirection: 'column',
        gap: 12,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        backgroundColor: COLORS.highlight,
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '800',
        lineHeight: 16,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    unavailableTitle: {
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 18,
        letterSpacing: 0.15,
        textAlign: 'center',
    },
    unavailableSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        marginTop: 4,
        textAlign: 'center',
    },
    cardContent: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 8,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '800',
        lineHeight: 20,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    originalPrice: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        textDecorationLine: 'line-through',
    },
    discountedPrice: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 22,
    },
    addButton: {
        height: 40,
        borderRadius: 9999,
        overflow: 'hidden',
        minWidth: 84,
    },
    addButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 9999,
        overflow: 'hidden',
        minWidth: 84,
        backgroundColor: '#e5e7eb',
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 18,
        letterSpacing: 0.15,
    },
    unavailableButtonText: {
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 18,
        letterSpacing: 0.15,
    },
});

export default ProductCard;