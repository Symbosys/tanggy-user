// import { NavigationProp } from '@react-navigation/native';
// import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { useAuth } from '../../context/AuthContext';
// import { Product } from '../../types/product.type';
// import { RootStackParamList } from '../../types/type';
// import { calculateDiscount, ErrorMessage, parseToDecimal } from '../../utils/utils';
// import { COLORS } from '../../theme/theme';
// import { useState } from 'react';
// import { useCartStore } from '../../store/cart';
// import { AxiosError } from 'axios';

// const ProductCard = ({ product, navigation }: { product: Product, navigation: NavigationProp<RootStackParamList> }) => {
//     const { isAuthenticated } = useAuth();
//     const { addToCart } = useCartStore();

//     const [quantity, setQuantity] = useState(Number(product.cartQuantity) || 0);

//     // 🧭 Navigate to details screen
//     const handleNavigateToDetails = () => {
//         navigation.navigate("ProductDetails", { product });
//     };

//     const handleIncreaseQuantity = async () => {
//         if (!isAuthenticated) {
//             Alert.alert(
//                 "Login Required",
//                 "You need to log in to add this product to your cart.",
//                 [
//                     { text: "Login", onPress: () => navigation.navigate("Login") },
//                     { text: "Cancel", style: "cancel" },
//                 ]
//             );
//             return;
//         }

//         const newQuantity = (quantity || 0) + 1;
//         setQuantity(newQuantity);
//         try {
//             await addToCart(Number(product.id), newQuantity);
//         } catch (error) {
//             ErrorMessage(error as AxiosError | Error);
//         }
//     };

//     const handleDecreaseQuantity = async () => {
//         if (!isAuthenticated) {
//             Alert.alert(
//                 "Login Required",
//                 "You need to log in to add this product to your cart.",
//                 [
//                     { text: "Login", onPress: () => navigation.navigate("Login") },
//                     { text: "Cancel", style: "cancel" },
//                 ]
//             );
//             return;
//         }

//         if (quantity <= 0) return;

//         const newQuantity = quantity - 1;
//         setQuantity(newQuantity);
//         try {
//             await addToCart(Number(product.id), newQuantity);
//         } catch (error) {
//             ErrorMessage(error as AxiosError | Error);
//         }
//     };

//     return (
//         <TouchableOpacity activeOpacity={0.9} onPress={handleNavigateToDetails}>
//             <View style={styles.productCard}>
//                 {/* Overlay when product is not available */}
//                 {!product.isAvailable && (
//                     <View style={styles.unavailableOverlay}>
//                         <Text style={styles.unavailableText}>Not Available</Text>
//                     </View>
//                 )}

//                 <Image
//                     source={{ uri: product?.images[0]?.image.url }}
//                     style={styles.productImage}
//                 />

//                 {/* Badge */}
//                 <View style={styles.productBadge}>
//                     <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.primary} />
//                     <Text style={styles.badgeText}>INDIA'S #1 CHOICE</Text>
//                 </View>

//                 {/* Quantity Controls */}
//                 <View style={styles.qtyWrapper}>
//                     {quantity === 0 ? (
//                         <TouchableOpacity onPress={handleIncreaseQuantity} style={styles.addButton}>
//                             <MaterialIcons name="add" size={20} color={COLORS.primary} />
//                         </TouchableOpacity>
//                     ) : (
//                         <View style={styles.qtyContainer}>
//                             <TouchableOpacity onPress={handleDecreaseQuantity}>
//                                 <MaterialIcons name="remove" size={20} color={COLORS.primary} />
//                             </TouchableOpacity>
//                             <Text style={styles.qtyText}>{quantity}</Text>
//                             <TouchableOpacity onPress={handleIncreaseQuantity}>
//                                 <MaterialIcons name="add" size={20} color={COLORS.primary} />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 </View>

//                 <Text style={styles.productName}>{product.name}</Text>
//                 <Text style={styles.productDetails}>
//                     {product.weight} g | {product.pieces}{" "}
//                     {Number(product.pieces) === 1 ? "piece" : "pieces"}
//                 </Text>

//                 <View style={styles.priceRow}>
//                     <Text style={styles.productPrice}>₹{parseToDecimal(product.sellingPrice).toFixed(2)}</Text>
//                     {product?.marketPrice && (
//                         <Text style={styles.productOriginalPrice}>
//                             ₹{parseToDecimal(product.marketPrice).toFixed(2)}
//                         </Text>
//                     )}
// {product?.marketPrice && (
//     <Text style={styles.productDiscount}>
//         {calculateDiscount(product.marketPrice, product.sellingPrice)}% off
//     </Text>
// )}
//                 </View>

//                 <View style={styles.deliveryInfo}>
//                     <MaterialCommunityIcons name="lightning-bolt" size={14} color={COLORS.highlight} />
//                     <Text style={styles.deliveryInfoText}>Delivery in 30 mins</Text>
//                 </View>
//             </View>
//         </TouchableOpacity>
//     );
// };

// const styles = StyleSheet.create({
//     productCard: {
//         width: 200,
//         marginRight: 16,
//         backgroundColor: COLORS.secondary,
//         borderRadius: 8,
//         shadowColor: COLORS.muted,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//         elevation: 3,
//         position: 'relative',
//         marginBottom: 15,
//     },
//     productImage: {
//         width: '100%',
//         height: 120,
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//     },
//     productBadge: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: COLORS.white,
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 12,
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     badgeText: {
//         fontSize: 8,
//         color: COLORS.primary,
//         fontWeight: 'bold',
//         marginLeft: 2,
//     },
//     qtyWrapper: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//     },
//     addButton: {
//         backgroundColor: COLORS.white,
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: COLORS.muted,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     qtyContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         shadowColor: COLORS.muted,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     qtyText: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         marginHorizontal: 6,
//     },
//     productName: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         marginTop: 8,
//         marginHorizontal: 12,
//     },
//     productDetails: {
//         fontSize: 12,
//         color: COLORS.textSecondary,
//         margin: 12,
//         marginTop: 4,
//     },
//     priceRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: 12,
//         marginBottom: 8,
//     },
//     productPrice: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: COLORS.primary,
//         marginRight: 8,
//     },
//     productOriginalPrice: {
//         fontSize: 12,
//         color: COLORS.muted,
//         textDecorationLine: 'line-through',
//         marginRight: 8,
//     },
//     productDiscount: {
//         fontSize: 12,
//         color: "#4caf50",
//         fontWeight: 'bold',
//     },
//     deliveryInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginHorizontal: 12,
//         marginBottom: 12,
//     },
//     deliveryInfoText: {
//         fontSize: 12,
//         color: COLORS.highlight,
//         marginLeft: 4,
//     },
//     // 🆕 Unavailable overlay
//     unavailableOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(250, 250, 250, 0.8)',
//         zIndex: 10,
//         borderRadius: 8,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     unavailableText: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: COLORS.primary,
//         backgroundColor: COLORS.white,
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//         overflow: 'hidden',
//         elevation: 2,
//     },
// });

// export default ProductCard;





import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../types/product.type';
import { parseToDecimal } from '../../../utils/utils';
import { COLORS } from '../../../theme/theme';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    onAddToCart: (e: any) => void;
    showBestsellerBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    onAddToCart,
    showBestsellerBadge = false,
}) => {
    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={onPress}
            activeOpacity={0.95}
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
                source={{ uri: product.images[0]?.image.url || '' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productWeight}>
                    {product.weight}g | {product.pieces} {Number(product.pieces) === 1 ? "piece" : "pieces"}
                </Text>
                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>₹{parseToDecimal(product.sellingPrice).toFixed(2)}</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onAddToCart}
                    >
                        <Icon name="add" size={24} color={COLORS.white} />
                    </TouchableOpacity>
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