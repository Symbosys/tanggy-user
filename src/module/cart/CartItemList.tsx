import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import { cartStyles as styles } from './styles';
import { useCartStore } from '../../store/cart';
import { useCartActions, useCartCalculations } from './hooks';

export const CartItemList: React.FC = () => {
    const { cartItems } = useCartStore();
    const { increaseQty, decreaseQty } = useCartActions();
    const { getSellingPrice } = useCartCalculations();

    return (
        <View style={styles.itemsList}>
            {cartItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                        <ImageBackground
                            source={{
                                uri: item.product.images[0]?.image.url || 'https://via.placeholder.com/64x64?text=Product',
                            }}
                            style={styles.itemImage}
                            imageStyle={styles.itemImage}
                            resizeMode="cover"
                        />
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.product.name}
                            </Text>
                            {item.pricing && item.pricing.discountAmount > 0 ? (
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.itemOriginalPrice}>
                                            ₹{item.pricing.originalPrice.toFixed(2)}
                                        </Text>
                                        <Text style={[styles.itemPrice, { color: '#059669', fontWeight: '800' }]}>
                                            ₹{item.pricing.finalPrice.toFixed(2)}
                                        </Text>
                                    </View>
                                    {item.pricing.appliedOffer?.badgeText ? (
                                        <View style={styles.itemOfferBadge}>
                                            <Text style={styles.itemOfferBadgeText}>
                                                {item.pricing.appliedOffer.badgeText}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.itemPrice}>₹{getSellingPrice(item).toFixed(2)}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={[styles.quantityButton]}
                            onPress={() => decreaseQty(item)}
                        >
                            <Text style={[styles.quantityIcon]}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.quantityInput}
                            value={item.quantity.toString()}
                            keyboardType="numeric"
                            selectTextOnFocus={false}
                            editable={false}
                        />
                        <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQty(item)}>
                            <Text style={styles.quantityIcon}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};
