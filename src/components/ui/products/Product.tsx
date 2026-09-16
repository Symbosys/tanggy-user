import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../context/AuthContext';
import { useAlertStore } from '../../../store/alert.store';
import { useCartStore } from '../../../store/cart';
import { COLORS } from '../../../theme/theme';
import { Product } from '../../../types/product.type';
import { parseToDecimal } from '../../../utils/utils';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    showBestsellerBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    showBestsellerBadge = false,
}) => {
    const { getQuantity, incrementQuantity, decrementQuantity } = useCartStore();
    const { isAuthenticated } = useAuth();
    const { showAlert } = useAlertStore();
    const navigation = useNavigation<any>();

    const quantity = getQuantity(product.id);

    const handleAdd = () => {
        if (!product.isAvailable) return;
        if (!isAuthenticated) {
            showAlert({
                title: 'Login Required',
                message: 'You need to log in to add this product to your cart.',
                confirmText: 'Login',
                cancelText: 'Cancel',
                onConfirm: () => navigation.navigate('Login')
            });
            return;
        }
        incrementQuantity(product);
    };

    const handleIncrement = () => {
        if (!product.isAvailable) return;
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
        incrementQuantity(product);
    };

    const handleDecrement = () => {
        if (!product.isAvailable) return;
        if (!isAuthenticated) return; // No alert needed on decrement if not logged in
        decrementQuantity(product);
    };

    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={product.isAvailable ? onPress : undefined}
            activeOpacity={product.isAvailable ? 0.95 : 1}
        >
            {!product.isAvailable && (
                <View style={styles.unavailableOverlay}>
                    <Text style={styles.unavailableText}>Not Available</Text>
                </View>
            )}
            {showBestsellerBadge && (
                <View style={styles.bestsellerBadge}>
                    <Text style={styles.bestsellerText}>Bestseller</Text>
                </View>
            )}
            <Image
                source={{ uri: product.images[0]?.image.url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGtO6CtXQzXjIOl0f-UI7upTYW9Bw58orLQ&s' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productWeight} numberOfLines={1}>
                    {product.weight} | {product.pieces}{' '}
                    {Number(product.pieces) === 1 ? 'piece' : 'pieces'}
                </Text>
                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                        ₹{parseToDecimal(product.sellingPrice).toFixed(2)}
                    </Text>
                    {quantity === 0 ? (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAdd}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.8}
                        >
                            <Icon name="add" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleDecrement}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                activeOpacity={0.8}
                            >
                                <Icon name="remove" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleIncrement}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                activeOpacity={0.8}
                            >
                                <Icon name="add" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    productCard: {
        width: 172,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        position: 'relative',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    productImage: {
        width: '100%',
        height: 128,
        backgroundColor: COLORS.background,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    productWeight: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
        marginBottom: 10,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 17,
        fontWeight: '900',
        color: COLORS.textPrimary,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.border,
        borderRadius: 16,
        padding: 2,
    },
    quantityButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: COLORS.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        minWidth: 18,
        textAlign: 'center',
        marginHorizontal: 3,
    },
    bestsellerBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.textPrimary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        zIndex: 1,
    },
    bestsellerText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 250, 250, 0.85)',
        zIndex: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});

export default ProductCard;