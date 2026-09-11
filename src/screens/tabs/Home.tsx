import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VideoRef } from 'react-native-video';
import { useGetAllCategories } from '../../api/hooks/useCategory';
import { useGetAllModes } from '../../api/hooks/useMode';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { EliteMemberShipCard, FloatingEliteMembership } from '../../components/common/EliteMembership';
import Offer from '../../components/home/Offer';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import HomeLoading from '../../components/skeleton/HomeSkeleton';
import CategoryList from '../../components/ui/CategoryList';
import ProductCard from '../../components/ui/products/Product';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { useModeStore } from '../../store/mode';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: AppNavigation) {
  const queryClient = useQueryClient();
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const videoRef = useRef<VideoRef>(null);
  const { latitude, longitude, primaryLocation, secondaryLocation, initializeLocation } =
    useLocationStore();
  const { userId, isAuthenticated } = useAuth();
  const {
    totalItems: totalCartItems,
    subtotal: subTotal,
    fetchCart,
  } = useCartStore();

  const { data: modes = [], isLoading: isModesLoading } = useGetAllModes();
  const { selectedMode, setSelectedMode } = useModeStore();

  // Auto-select first mode if none selected yet
  useEffect(() => {
    if (modes && modes.length > 0 && !selectedMode) {
      setSelectedMode(modes[0]);
    }
  }, [modes, selectedMode, setSelectedMode]);

  // Synchronize cart whenever selectedMode changes or user authenticates
  useEffect(() => {
    if (selectedMode?.id && userId) {
      useCartStore.getState().switchMode(selectedMode.id);
    }
  }, [selectedMode?.id, userId]);

  // TanStack Query for Categories (cached per modeId with 5min staleTime)
  const {
    data: category = [],
    isLoading: isCategoriesLoading,
  } = useGetAllCategories(
    { modeId: selectedMode?.id },
    { enabled: Boolean(selectedMode?.id) }
  );

  console.log('isAuthenticated', isAuthenticated)

  console.log('cartItems', totalCartItems, subTotal, isAuthenticated, userId);

  // TanStack Query for Bestsellers (horizontal infinite scroll, limit: 10, cached per modeId)
  const {
    data: bestSellersData,
    isLoading: isBestsellersLoading,
    fetchNextPage: fetchNextBestSellers,
    hasNextPage: hasNextBestSellers,
    isFetchingNextPage: isFetchingNextBestSellers,
  } = useGetAllProducts(
    {
      isBestSeller: true,
      limit: 10,
      isActive: true,
      modeId: selectedMode?.id,
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      userId: userId ?? undefined,
    },
    {
      enabled: Boolean(selectedMode?.id),
    }
  );

  const bestsellerProducts =
    bestSellersData?.pages.flatMap((page) => page.products) || [];

  // TanStack Query for Recommended Products (horizontal infinite scroll, limit: 10, cached per modeId)
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
      modeId: selectedMode?.id,
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      userId: userId ?? undefined,
    },
    {
      enabled: Boolean(isAuthenticated && selectedMode?.id),
    }
  );

  const recommendedProducts =
    recommendedData?.pages.flatMap((page) => page.products) || [];

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

  // Determine if core data for the currently selected mode is still loading
  const isModeDataLoading =
    (!selectedMode && isModesLoading) ||
    (!selectedMode && modes.length > 0) ||
    (isCategoriesLoading && category.length === 0) ||
    (isBestsellersLoading && bestsellerProducts.length === 0);

  // Render Loading State on cold start or when first visiting an uncached mode
  if (isModeDataLoading) {
    return (
      <HomeLoading
        title={selectedMode?.name ? `Loading ${selectedMode.name}...` : 'Loading Fresh Delights...'}
      />
    );
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
              refreshing={isRefreshing}
              onRefresh={async () => {
                setIsRefreshing(true);
                try {
                  await Promise.allSettled([
                    queryClient.invalidateQueries({ queryKey: ['categories'] }),
                    queryClient.invalidateQueries({ queryKey: ['products'] }),
                    queryClient.invalidateQueries({ queryKey: ['modes'] }),
                    queryClient.invalidateQueries({ queryKey: ['orders'] }),
                    userId ? fetchCart(undefined, undefined, selectedMode?.id) : Promise.resolve(),
                  ]);
                } catch (error) {
                  console.error('Error refreshing home data', error);
                } finally {
                  setIsRefreshing(false);
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

              <View style={styles.headerRightActions}>
                <TouchableOpacity
                  style={styles.searchIconButton}
                  onPress={handleSearchPress}
                  activeOpacity={0.7}
                >
                  <Icon name="search" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => { navigation.navigate('Accounts'); }}
                  activeOpacity={0.7}
                >
                  <Icon name="person" size={32} color={COLORS.textPrimary} />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Horizontal Scrolling Modes */}
            {modes && modes.length > 0 && (
              <View style={styles.modesSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.modesScrollContent}
                >
                  {modes.map((mode) => {
                    const isSelected = selectedMode?.id === mode.id;
                    const imageUrl =
                      mode.image?.secure_url ||
                      mode.image?.url ||
                      mode.icon?.secure_url ||
                      mode.icon?.url;

                    return (
                      <TouchableOpacity
                        key={String(mode.id)}
                        style={[
                          styles.modeCard,
                          isSelected && styles.modeCardSelected,
                        ]}
                        onPress={() => {
                          setSelectedMode(mode);
                          useCartStore.getState().switchMode(mode.id);
                        }}
                        activeOpacity={0.8}
                      >
                        {imageUrl ? (
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.modeImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.modeIconPlaceholder,
                              isSelected && styles.modeIconPlaceholderSelected,
                            ]}
                          >
                            <Icon
                              name="restaurant"
                              size={16}
                              color={isSelected ? COLORS.primary : COLORS.muted}
                            />
                          </View>
                        )}

                        <View style={styles.modeTextContainer}>
                          <Text
                            style={[
                              styles.modeName,
                              isSelected && styles.modeNameSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {mode.name}
                          </Text>

                          {mode.badge ? (
                            <View
                              style={[
                                styles.modeBadge,
                                isSelected && styles.modeBadgeSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.modeBadgeText,
                                  isSelected && styles.modeBadgeTextSelected,
                                ]}
                                numberOfLines={1}
                              >
                                {mode.badge}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
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
    marginBottom: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  modesSection: {
    marginTop: 2,
  },
  modesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  modeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F7EEFD',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  modeImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  modeIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modeIconPlaceholderSelected: {
    backgroundColor: '#EBD4F9',
  },
  modeTextContainer: {
    justifyContent: 'center',
  },
  modeName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modeNameSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  modeBadgeSelected: {
    backgroundColor: COLORS.primary,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
  },
  modeBadgeTextSelected: {
    color: '#FFFFFF',
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





















