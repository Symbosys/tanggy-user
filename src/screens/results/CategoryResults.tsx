import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import { InlineLoading } from '../../components/ui/loader/InlineLoading';
import { useAuth } from '../../context/AuthContext';
import { getAllSubCategories } from '../../services/subcategory.service';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Product, SubCategory } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');
const GAP = 12;
const cardWidth = (screenWidth - 32 - GAP) / 2;

/* Product Card */
const ProductCard = ({
  product,
  navigation,
}: {
  product: Product;
  navigation: AppNavigation['navigation'];
}) => {
  const { getQuantity, incrementQuantity, decrementQuantity } = useCartStore();
  const { isAuthenticated } = useAuth();
  const { showAlert } = useAlertStore();

  const quantity = getQuantity(product.id);

  const marketPrice = product.marketPrice;
  const sellingPrice = product.sellingPrice;
  const discountPercent =
    marketPrice && parseToDecimal(marketPrice) > parseToDecimal(sellingPrice)
      ? Math.round(
          ((parseToDecimal(marketPrice) - parseToDecimal(sellingPrice)) /
            parseToDecimal(marketPrice)) *
            100
        )
      : 0;
  const piecesText = Number(product.pieces) === 1 ? 'piece' : 'pcs';
  const details = product.description
    ? product.description
    : `${product.weight}${product.pieces ? ` • ${product.pieces} ${piecesText}` : ''}`;

  const rating = (4.5 + ((product.id.charCodeAt(0) * 0.1) % 0.4)).toFixed(1);
  const reviewCount = 120 + ((product.id.charCodeAt(0) * 17) % 250);

  const handleNavigateToDetails = () => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleAdd = () => {
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
    incrementQuantity(product);
  };

  const handleIncrement = () => {
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
    if (!isAuthenticated) return;
    decrementQuantity(product);
  };

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      {!product.isAvailable && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Not Available</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handleNavigateToDetails}
        activeOpacity={0.9}
        disabled={!product.isAvailable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                product.images?.[0]?.image?.url ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdGtO6CtXQzXjIOl0f-UI7upTYW9Bw58orLQ&s',
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productDetails} numberOfLines={2}>
            {details}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Icon name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingValue}> {rating}</Text>
            <Text style={styles.reviewCount}> ({reviewCount})</Text>
          </View>

          {/* Price and Add/Quantity row */}
          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.newPrice}>
                ₹{parseToDecimal(sellingPrice).toFixed(0)}
              </Text>
              {marketPrice && parseToDecimal(marketPrice) > parseToDecimal(sellingPrice) && (
                <Text style={styles.oldPrice}>
                  ₹{parseToDecimal(marketPrice).toFixed(0)}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAdd}
                disabled={!product.isAvailable}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>Add</Text>
                <Icon name="add" size={14} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  onPress={handleDecrement}
                >
                  <Icon name="remove" size={12} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  onPress={handleIncrement}
                >
                  <Icon name="add" size={12} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const CategoryResults = ({ navigation }: AppNavigation) => {
  const route = useRoute();
  const {
    categoryId,
    categoryName = 'Products',
    search: initialSearch,
  } = (route.params as any) || {};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || '');
  const isBestSeller = categoryName === 'Bestsellers';
  const isRecommended = categoryName === 'Recommended For You';
  const { latitude, longitude } = useLocationStore();
  const { userId, isAuthenticated } = useAuth();
  const { totalItems: totalCartItems } = useCartStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch subcategories on mount if categoryId exists
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryId) {
        return;
      }
      try {
        const response = await getAllSubCategories({ categoryId });
        if (response.success) {
          setSubCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubCategories();
  }, [categoryId]);

  // Dynamic categories for UI
  const displayCategories = ['All', ...subCategories.map((sc) => sc.name)];

  const selectedSubId =
    selectedCategory !== 'All'
      ? subCategories.find((sc) => sc.name === selectedCategory)?.id
      : undefined;

  const searchStr = debouncedSearch.trim();
  const hasCategoryOrSpecial = Boolean(
    categoryId || isBestSeller || isRecommended || searchStr
  );

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetAllProducts(
    {
      isActive: true,
      limit: 15,
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      userId: userId ?? undefined,
      categoryId: categoryId || undefined,
      subCategoryId: selectedSubId || undefined,
      search: searchStr || undefined,
      isBestSeller: isBestSeller || undefined,
      isRecommended: isRecommended || undefined,
    },
    {
      enabled: hasCategoryOrSpecial,
    }
  );

  const products = data?.pages.flatMap((page) => page.products) || [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar with Back, Title & Cart */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName}
        </Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="shopping-bag" size={22} color={COLORS.textPrimary} />
          {totalCartItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input Bar (when not in special collections) */}
      {!isBestSeller && !isRecommended && (
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color={COLORS.textPrimary} />
            <TextInput
              placeholder={`Search in ${categoryName.toLowerCase()}...`}
              placeholderTextColor={COLORS.muted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={COLORS.primary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <Icon name="close" size={14} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Subcategories Horizontal Scroll */}
      {categoryId && subCategories.length > 0 && (
        <View style={styles.categoryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {displayCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    isActive && styles.activeCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.activeCategoryChipText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    if (isLoading || (products.length === 0 && isFetching)) {
      return <InlineLoading visible={true} />;
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="restaurant" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find items in this category. Try another filter or search keyword.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            navigation={navigation}
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        ListEmptyComponent={renderEmpty()}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={Boolean(isFetching && !isFetchingNextPage && !isLoading)}
        onRefresh={refetch}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {isAuthenticated && (
        <UnifiedFloatingBar
          hasBottomTab={false}
          onCartPress={() => navigation.navigate('Cart')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    gap: GAP,
    marginBottom: 12,
  },
  headerContainer: {
    marginBottom: 12,
    marginHorizontal: -16,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  clearSearchBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryWrapper: {
    paddingVertical: 4,
    marginBottom: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  activeCategoryChipText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  productCard: {
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
    position: 'relative',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 118,
    position: 'relative',
    backgroundColor: COLORS.secondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  discountBadgeText: {
    color: COLORS.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  productDetails: {
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
  newPrice: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  oldPrice: {
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
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.error,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryResults;