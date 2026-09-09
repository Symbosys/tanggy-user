import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProductCard from '../ui/products/Product';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { Product } from '../../types/product.type';
import { COLORS } from '../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OfferProductsSectionProps {
  offerId: string | number;
  isPeriodOffer?: boolean;
  onRegisterLoadMore?: (fn: () => void) => void;
}

export const OfferProductsSection: React.FC<OfferProductsSectionProps> = ({
  offerId,
  isPeriodOffer = false,
  onRegisterLoadMore,
}) => {
  const navigation = useNavigation<any>();

  // Primary query: Fetch products linked specifically to this offer
  const {
    data: offerProductsData,
    isLoading: isLoadingOfferProducts,
    fetchNextPage: fetchNextOfferProducts,
    hasNextPage: hasNextOfferProducts,
    isFetchingNextPage: isFetchingNextOfferProducts,
  } = useGetAllProducts({
    offerId,
    isActive: true,
    limit: 5,
  });

  const offerProducts =
    offerProductsData?.pages.flatMap((page) => page.products) || [];
  const hasSpecificProducts = offerProducts.length > 0;

  // If it's a periodic offer and has no specific products linked, fall back to all store products
  const shouldFallbackToAll =
    isPeriodOffer && !isLoadingOfferProducts && !hasSpecificProducts;

  const {
    data: allProductsData,
    isLoading: isLoadingAllProducts,
    fetchNextPage: fetchNextAllProducts,
    hasNextPage: hasNextAllProducts,
    isFetchingNextPage: isFetchingNextAllProducts,
  } = useGetAllProducts(
    { isActive: true, limit: 5 },
    { enabled: shouldFallbackToAll }
  );

  const isLoading =
    isLoadingOfferProducts || (shouldFallbackToAll && isLoadingAllProducts);

  const activeQuery = shouldFallbackToAll
    ? {
        data: allProductsData,
        fetchNextPage: fetchNextAllProducts,
        hasNextPage: hasNextAllProducts,
        isFetchingNextPage: isFetchingNextAllProducts,
      }
    : {
        data: offerProductsData,
        fetchNextPage: fetchNextOfferProducts,
        hasNextPage: hasNextOfferProducts,
        isFetchingNextPage: isFetchingNextOfferProducts,
      };

  const displayProducts: Product[] =
    activeQuery.data?.pages.flatMap((page) => page.products) || [];
  const hasNextPage = Boolean(activeQuery.hasNextPage);
  const isFetchingNextPage = Boolean(activeQuery.isFetchingNextPage);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, activeQuery]);

  useEffect(() => {
    if (onRegisterLoadMore) {
      onRegisterLoadMore(handleLoadMore);
    }
  }, [onRegisterLoadMore, handleLoadMore]);

  // Title and subtitle depending on offer type and fallback status
  const sectionTitle = isPeriodOffer
    ? shouldFallbackToAll
      ? 'Store-Wide Eligible Items'
      : 'Qualifying Challenge Products'
    : 'Applicable Products';

  const sectionSubtitle = isPeriodOffer
    ? shouldFallbackToAll
      ? 'All items in our catalog contribute towards your milestone goal'
      : 'Purchase from this exclusive list to advance your quest'
    : 'This special offer applies to the following curated items';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching applicable items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.titleWithIcon}>
            <MaterialIcons
              name="local-mall"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          </View>
          {displayProducts.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {displayProducts.length} Items
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
      </View>

      {/* Product Grid or Empty State */}
      {displayProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons
              name="shopping-bag"
              size={36}
              color="#9CA3AF"
            />
          </View>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            {isPeriodOffer
              ? 'No eligible products are currently available for this milestone challenge.'
              : 'There are currently no products linked to this specific offer.'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.gridContainer}>
            {displayProducts.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  product={product}
                  onPress={() =>
                    navigation.navigate('ProductDetails', { product })
                  }
                />
              </View>
            ))}
          </View>

          {/* Loading More Spinner (Infinite Scroll) */}
          {isFetchingNextPage && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingMoreText}>Loading next products...</Text>
            </View>
          )}

          {/* Manual Load More Button */}
          {!isFetchingNextPage && hasNextPage && displayProducts.length > 0 && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreButtonText}>Load More Products</Text>
              <MaterialIcons name="expand-more" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {/* Reached End */}
          {!hasNextPage && displayProducts.length > 0 && (
            <View style={styles.endContainer}>
              <Text style={styles.endText}>All products loaded</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (SCREEN_WIDTH - 44) / 2, // 16px left/right padding + 12px gap
    marginBottom: 14,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingMoreContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadMoreButton: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  loadMoreButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  endContainer: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  endText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});
