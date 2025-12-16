import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../types/product.type';
import { AppNavigation } from '../../../types/type';
import { calculateDiscount, parseToDecimal } from '../../../utils/utils';
import { COLORS } from '../../../theme/theme';

interface ProductCardProps {
    product: Product;
    navigation: AppNavigation['navigation'];
    handleNavigateToDetails: (product: Product) => void;
    quantity: number;
    onAdd: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    style?: any;
}

const DiscountProduct: React.FC<ProductCardProps> = ({
    product,
    navigation,
    handleNavigateToDetails,
    quantity,
    onAdd,
    onIncrement,
    onDecrement,
    style,
}) => {
    const discount = calculateDiscount(product.marketPrice, product.sellingPrice);
    const piecesText = Number(product.pieces) === 1 ? 'piece' : 'pieces';
    const description = `${product.weight}g • ${product.pieces} ${piecesText}`;
    const originalPrice = product.marketPrice ? parseToDecimal(product.marketPrice).toFixed(2) : null;
    const discountedPrice = parseToDecimal(product.sellingPrice).toFixed(2);
    const unavailable = !product.isAvailable;
    const image = product.images?.[0]?.image.url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGtO6CtXQzXjIOl0f-UI7upTYW9Bw58orLQ&s';
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
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={styles.description}>{description}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.discountedPrice, unavailable && { color: COLORS.textSecondary }]}>
                            ₹{discountedPrice}
                        </Text>
                        {originalPrice && (
                            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                        )}
                    </View>
                </View>

                {/* Dynamic Add to Cart / Quantity Controls */}
                {unavailable ? (
                    <View style={styles.unavailableButton}>
                        <Text style={styles.unavailableButtonText}>Add to Cart</Text>
                    </View>
                ) : quantity === 0 ? (
                    <TouchableOpacity style={styles.addButton} onPress={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}>
                        <LinearGradient
                            colors={[COLORS.primary, '#b58ff0']}
                            style={styles.addButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.quantityButton} onPress={(e) => {
                            e.stopPropagation();
                            onDecrement();
                        }}>
                            <Icon name="remove" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={(e) => {
                            e.stopPropagation();
                            onIncrement();
                        }}>
                            <Icon name="add" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
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
        ...StyleSheet.absoluteFillObject,
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
        textAlign: 'center',
    },
    unavailableSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 4,
    },
    cardContent: {
        flex: 1,
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
        lineHeight: 18,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    discountedPrice: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '800',
    },
    addButton: {
        height: 40,
        borderRadius: 9999,
        overflow: 'hidden',
    },
    addButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '800',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        height: 40,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    unavailableButton: {
        height: 40,
        borderRadius: 9999,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableButtonText: {
        color: COLORS.muted,
        fontSize: 14,
        fontWeight: '800',
    },
});

export default DiscountProduct;