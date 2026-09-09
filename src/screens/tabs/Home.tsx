import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VideoRef } from 'react-native-video';
import api from '../../api/api';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { EliteMemberShipCard, FloatingEliteMembership } from '../../components/common/EliteMembership';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import HomeLoading from '../../components/skeleton/HomeSkeleton';
import CategoryList from '../../components/ui/CategoryList';
import ProductCard from '../../components/ui/products/Product';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Category, Product } from '../../types/product.type';
import Offer from '../../components/home/Offer';
import { AppNavigation } from '../../types/type';
import { ErrorMessage } from '../../utils/utils';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: AppNavigation) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<Category[]>([]);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const videoRef = useRef<VideoRef>(null);
  const { latitude, longitude, primaryLocation, secondaryLocation, initializeLocation } =
    useLocationStore();
  const { userId, isAuthenticated } = useAuth();
  const {
    totalItems: totalCartItems,
    subtotal: subTotal,
    fetchCart,
  } = useCartStore();

  console.log('isAuthenticated', isAuthenticated)

  console.log('cartItems', totalCartItems, subTotal, isAuthenticated, userId);

  // TanStack Query for Bestsellers (horizontal infinite scroll, limit: 10)
  const {
    data: bestSellersData,
    fetchNextPage: fetchNextBestSellers,
    hasNextPage: hasNextBestSellers,
    isFetchingNextPage: isFetchingNextBestSellers,
  } = useGetAllProducts({
    isBestSeller: true,
    limit: 10,
    isActive: true,
    lat: latitude ?? undefined,
    lng: longitude ?? undefined,
    userId: userId ?? undefined,
  });

  const bestsellerProducts =
    bestSellersData?.pages.flatMap((page) => page.products) || [];

  // TanStack Query for Recommended Products (horizontal infinite scroll, limit: 10)
  const {
    data: recommendedData,
    fetchNextPage: fetchNextRecommended,
    hasNextPage: hasNextRecommended,
    isFetchingNextPage: isFetchingNextRecommended,
  } = useGetAllProducts(
    {
      isRecommended: true,
      limit: 10,
      isActive: true,
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      userId: userId ?? undefined,
    },
    {
      enabled: Boolean(isAuthenticated),
    }
  );

  const recommendedProducts =
    recommendedData?.pages.flatMap((page) => page.products) || [];

  const fetchCategories = async () => {
    try {
      const res = await api.get('/category/all');
      setCategory(res.data.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          type: 'error',
          text1: error.response?.data.message || 'Something went wrong',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
        });
      }
    }
  };

  // Unified Data Fetching with Loading State
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.allSettled([
          fetchCategories(),
          userId ? fetchCart() : Promise.resolve(),
        ]);
      } catch (error) {
        console.error('Error loading home data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [latitude, longitude, userId]);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  // Ensure video starts playing once ready
  useEffect(() => {
    if (isVideoReady && videoRef.current) {
      videoRef.current.seek(0);
    }
  }, [isVideoReady]);

  const onVideoLoad = () => {
    setIsVideoReady(true);
  };

  const onVideoError = (error: any) => {
    console.log('Video Error:', error);
  };

  const handleNavigateToDetails = (product: Product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  // Render Loading State
  if (isLoading) {
    return <HomeLoading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={async () => {
                setIsLoading(true);
                try {
                  await Promise.allSettled([
                    fetchCategories(),
                    userId ? fetchCart() : Promise.resolve(),
                    queryClient.invalidateQueries({ queryKey: ['products'] }),
                    queryClient.invalidateQueries({ queryKey: ['orders'] }),
                  ]);
                } catch (error) {
                  console.error('Error refreshing home data', error);
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          }
        >
          {/* Systematic & Professional Header */}
          <View style={styles.topHeaderContainer}>
            {/* Location & Notification Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.locationSection}
                onPress={() => navigation.navigate('SelectLocation')}
                activeOpacity={0.7}
              >
                <View style={styles.locationCircle}>
                  <Icon name="place" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.locationInfo}>
                  <View style={styles.locationRow}>
                    <Text style={styles.primaryLocationText} numberOfLines={1}>
                      {primaryLocation || 'Select Location'}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={20} color={COLORS.textPrimary} />
                  </View>
                  <Text style={styles.secondaryLocationText} numberOfLines={1}>
                    {secondaryLocation || 'Tap to set address'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => { navigation.navigate('Accounts') }}
                activeOpacity={0.7}
              >
                <Icon name="person" size={35} color={COLORS.textPrimary} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <TouchableOpacity
                style={styles.searchBar}
                onPress={handleSearchPress}
                activeOpacity={0.9}
                onPressIn={() => navigation.navigate("Search")}
              >
                <Icon
                  name="search"
                  size={24}
                  color={COLORS.muted}
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPlaceholderText}>
                  Search for chicken, meat, or dishes…
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Offer category={category} navigation={navigation} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Categories Section */}
            <CategoryList categories={category} navigation={navigation} />

            {/* Bestsellers Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Bestsellers 🔥</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() =>
                    navigation.navigate('CategoryResults', {
                      categoryName: 'Bestsellers',
                    })
                  }
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productScroll}
                data={bestsellerProducts}
                keyExtractor={(product) => String(product.id)}
                renderItem={({ item: product }) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleNavigateToDetails(product)}
                    showBestsellerBadge={true}
                  />
                )}
                onEndReached={() => {
                  if (hasNextBestSellers && !isFetchingNextBestSellers) {
                    fetchNextBestSellers();
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextBestSellers ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  ) : null
                }
              />
            </View>

            {/* Recommended Section */}
            {isAuthenticated && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recommended For You</Text>
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() =>
                      navigation.navigate('CategoryResults', {
                        categoryName: 'Recommended For You',
                      })
                    }
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Icon name="arrow-forward" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productScroll}
                  data={recommendedProducts}
                  keyExtractor={(product) => String(product.id)}
                  renderItem={({ item: product }) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPress={() => handleNavigateToDetails(product)}
                      showBestsellerBadge={false}
                    />
                  )}
                  onEndReached={() => {
                    if (hasNextRecommended && !isFetchingNextRecommended) {
                      fetchNextRecommended();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetchingNextRecommended ? (
                      <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      </View>
                    ) : null
                  }
                />
              </View>
            )}

            {/* Bottom Spacer */}
            {!isAuthenticated && <EliteMemberShipCard />}
            <View style={{ height: 190 }} />
          </View>
        </ScrollView>



        {!isAuthenticated && <FloatingEliteMembership />}
        {isAuthenticated && (
          <UnifiedFloatingBar
            hasBottomTab={true}
            onCartPress={() => navigation.navigate('Cart')}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  topHeaderContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  locationCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF', // Light lavender
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryLocationText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 4,
  },
  secondaryLocationText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30', // Vibrant red
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  searchSection: {
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Light grey search bar background
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholderText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: '500',
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: 350,
    overflow: 'hidden',
  },
  mainContent: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  productScroll: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
});





















