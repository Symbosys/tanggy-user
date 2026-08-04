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
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productWeight}>
                    {product.weight}g | {product.pieces}{' '}
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
                        >
                            <Icon name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleDecrement}
                            >
                                <Icon name="remove" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleIncrement}
                            >
                                <Icon name="add" size={20} color={COLORS.white} />
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
        width: 176,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 128,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000000',
        marginBottom: 4,
    },
    productWeight: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8719C6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#8719C6',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        minWidth: 20,
        textAlign: 'center',
    },
    bestsellerBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    bestsellerText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 250, 250, 0.8)',
        zIndex: 10,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8719C6',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
});

export default ProductCard;