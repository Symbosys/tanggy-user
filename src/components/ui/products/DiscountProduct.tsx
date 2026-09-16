import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/theme';
import { Product } from '../../../types/product.type';
import { AppNavigation } from '../../../types/type';
import { calculateDiscount, parseToDecimal } from '../../../utils/utils';

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
  handleNavigateToDetails,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  style,
}) => {
  const discount = calculateDiscount(product.marketPrice, product.sellingPrice);
  const piecesText = Number(product.pieces) === 1 ? 'piece' : 'pcs';
  const description = product.description
    ? product.description
    : `${product.weight}${product.pieces ? ` • ${product.pieces} ${piecesText}` : ''}`;

  const originalPrice = product.marketPrice
    ? parseToDecimal(product.marketPrice).toFixed(0)
    : null;
  const discountedPrice = parseToDecimal(product.sellingPrice).toFixed(0);
  const unavailable = !product.isAvailable;
  const image =
    product.images?.[0]?.image.url ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGtO6CtXQzXjIOl0f-UI7upTYW9Bw58orLQ&s';
  const title = product.name;
  const discountStr = discount > 0 ? `${discount}% OFF` : '15% OFF';

  // Rating & review count derived deterministically
  const rating = (4.5 + ((product.id.charCodeAt(0) * 0.1) % 0.4)).toFixed(1);
  const reviewCount = 120 + ((product.id.charCodeAt(0) * 17) % 250);

  return (
    <TouchableOpacity
      style={[styles.cardTouchable, style]}
      onPress={() => handleNavigateToDetails(product)}
      disabled={unavailable}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Top Image Container with Discount Badge */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={[styles.image, unavailable && styles.imageUnavailable]}
            resizeMode="cover"
          />

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountStr}</Text>
          </View>

          {/* Unavailable Overlay */}
          {unavailable && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableTitle}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Star Rating Row */}
          <View style={styles.ratingRow}>
            <Icon name="star" size={13} color={COLORS.warning} />
            <Text style={styles.ratingValue}> {rating}</Text>
            <Text style={styles.reviewCount}> ({reviewCount})</Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.discountedPrice}>₹{discountedPrice}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
            </View>

            {/* Action Buttons */}
            {unavailable ? (
              <View style={styles.unavailableBtn}>
                <Text style={styles.unavailableBtnText}>Out of stock</Text>
              </View>
            ) : quantity === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.8}
                onPress={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
              >
                <Text style={styles.addBtnText}>Add</Text>
                <Icon name="add" size={15} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDecrement();
                  }}
                >
                  <Icon name="remove" size={13} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onIncrement();
                  }}
                >
                  <Icon name="add" size={13} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardTouchable: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 118,
    position: 'relative',
    backgroundColor: COLORS.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageUnavailable: {
    opacity: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  unavailableTitle: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '800',
  },
  cardContent: {
    padding: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  description: {
    color: COLORS.muted,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  reviewCount: {
    fontSize: 10.5,
    color: COLORS.muted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  discountedPrice: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  originalPrice: {
    color: COLORS.muted,
    fontSize: 11,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 3,
    paddingVertical: 2,
    gap: 4,
  },
  quantityBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
    minWidth: 14,
    textAlign: 'center',
  },
  unavailableBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unavailableBtnText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default DiscountProduct;