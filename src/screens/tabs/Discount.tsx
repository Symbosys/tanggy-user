import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import ProductCard from '../../components/ui/products/DiscountProduct';
import { useAuth } from '../../context/AuthContext';
import { useAlertStore } from '../../store/alert.store';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { useModeStore } from '../../store/mode';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const { width: screenWidth } = Dimensions.get('window');
const bannerHeight = screenWidth * 0.62;

const DealsScreen = ({ navigation }: AppNavigation) => {
  const { latitude, longitude } = useLocationStore();
  const { userId, isAuthenticated } = useAuth();
  const { selectedMode } = useModeStore();
  const { showAlert } = useAlertStore();

  const {
    getQuantity,
    incrementQuantity,
    decrementQuantity,
  } = useCartStore();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetAllProducts({
    isActive: true,
    marketPrice: 1, // Only products with marketPrice > sellingPrice
    limit: 15,
    modeId: selectedMode?.id,
    lat: latitude ?? undefined,
    lng: longitude ?? undefined,
    userId: userId ?? undefined,
  });

  const products = data?.pages.flatMap((page) => page.products) || [];

  const handleNavigateToDetails = (product: Product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const chunkArray = (array: Product[], size: number): Product[][] => {
    const chunks: Product[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const productChunks = chunkArray(products, 2);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAdd = (product: Product) => {
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

  const handleIncrement = (product: Product) => {
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

  const handleDecrement = (product: Product) => {
    if (!isAuthenticated) return;
    decrementQuantity(product);
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Promotional Hero Banner extending inside notch */}
      <View style={styles.bannerWrapper}>
        <Image
          source={require('../../assets/hero/discount_hero.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Deals</Text>
        <Text style={styles.sectionSubtitle}>
          Great food. Greater savings.
        </Text>
      </View>
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
    return null;
  };

  const renderEmpty = () => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="local-offer" size={48} color={COLORS.muted} />
        <Text style={styles.emptyText}>No discount deals available right now</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <FlatList
        style={styles.main}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={productChunks}
        keyExtractor={(row, index) =>
          `${row.map((p) => p.id).join('-')}-${index}`
        }
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((product, colIndex) => {
              const quantity = getQuantity(product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigation={navigation}
                  handleNavigateToDetails={handleNavigateToDetails}
                  quantity={quantity}
                  onAdd={() => handleAdd(product)}
                  onIncrement={() => handleIncrement(product)}
                  onDecrement={() => handleDecrement(product)}
                  style={colIndex === 0 ? styles.firstCol : undefined}
                />
              );
            })}
            {row.length === 1 && <View style={styles.spacer} />}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={Boolean(isFetching && !isFetchingNextPage && !isLoading)}
        onRefresh={refetch}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {isAuthenticated && (
        <UnifiedFloatingBar
          hasBottomTab={true}
          onCartPress={() => navigation.navigate('Cart')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  headerContainer: {
    marginBottom: 14,
  },
  bannerWrapper: {
    width: '100%',
    height: bannerHeight,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: COLORS.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  firstCol: {
    marginRight: 12,
  },
  spacer: {
    flex: 1,
    marginLeft: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default DealsScreen;