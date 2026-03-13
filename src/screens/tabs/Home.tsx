import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
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
import { EliteMemberShipCard, FloatingEliteMembership } from '../../components/common/EliteMembership';
import FloatingCart from '../../components/home/FloatingCart';
import HomeLoading from '../../components/skeleton/HomeSkeleton';
import CategoryList from '../../components/ui/CategoryList';
import ProductCard from '../../components/ui/products/Product';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts } from '../../services/product.service';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Category, Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { ErrorMessage } from '../../utils/utils';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: AppNavigation) {
  const [category, setCategory] = useState<Category[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
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

  const fetchBestSellerProducts = async () => {
    try {
      const response = await getAllProducts({
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        isActive: true,
        userId: userId ?? undefined,
        isBestSeller: true,
      });
      console.log('Best seller products:', response.data);
      setBestSellerProducts(response.data.products);
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const response = await getAllProducts({
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        isActive: true,
        userId: userId ?? undefined,
        isRecommended: true,
      });
      setRecommendedProducts(response.data.products);
      console.log('Recommended products:', response.data);
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
    }
  };

  // Unified Data Fetching with Loading State
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // We use Promise.allSettled so one failure doesn't stop others
        await Promise.allSettled([
          fetchCategories(),
          fetchBestSellerProducts(),
          userId ? fetchCart() : Promise.resolve(),
          userId ? fetchRecommendedProducts() : Promise.resolve(),
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

  const bestsellerProducts = bestSellerProducts;

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
                    fetchBestSellerProducts(),
                    userId ? fetchCart() : Promise.resolve(),
                    userId ? fetchRecommendedProducts() : Promise.resolve(),
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
                onPress={() => {navigation.navigate('Profile')}}
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

          {/* Banner/Header Image Section */}
          <View style={styles.bannerSection}>
            <ImageBackground
              source={require('../../assets/hero/Welcome.png')}
              style={styles.bannerImage}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            />
          </View>

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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productScroll}
              >
                {bestsellerProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleNavigateToDetails(product)}
                    showBestsellerBadge={true}
                  />
                ))}
              </ScrollView>
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productScroll}
                >
                  {recommendedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPress={() => handleNavigateToDetails(product)}
                      showBestsellerBadge={false}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bottom Spacer */}
            {!isAuthenticated && <EliteMemberShipCard />}
            <View style={{ height: 190 }} />
          </View>
        </ScrollView>



        {!isAuthenticated && <FloatingEliteMembership />}
        {/* Floating Cart Bar */}
        {totalCartItems > 0 && isAuthenticated && (
          <FloatingCart
            totalItems={totalCartItems}
            subTotal={subTotal}
            onPress={() => navigation.navigate('Cart')}
            hasBottomTab={true}
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





















