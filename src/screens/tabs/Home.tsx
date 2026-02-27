import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video, { VideoRef } from 'react-native-video';
import api from '../../api/api';
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
import { EliteMemberShipCard, FloatingEliteMembership } from '../../components/common/EliteMembership';
import LottieView from 'lottie-react-native';

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
          {/* Header with Gradient Background */}
          <View style={styles.headerContainer}>
            <ImageBackground
              source={require('../../assets/hero/Welcome.png')}
              style={styles.lottie}
              resizeMode="cover"
            />
            {/* <View style={styles.videoOverlay} /> */}
            <View style={styles.topBar}>
              {/* --- LOCATION SECTION --- */}
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={() => navigation.navigate('SelectLocation')}
                activeOpacity={0.8}
              >
                <Icon name="location-on" size={28} color={COLORS.primary} />
                <View style={styles.locationTextContainer}>
                  {/* Primary Location (Top) */}
                  <View style={styles.locationRow}>
                    <Text
                      style={styles.primaryLocationText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {primaryLocation || 'Select Location'}
                    </Text>
                    <Icon name="expand-more" size={20} color={COLORS.primary} />
                  </View>
                  {/* Secondary Location (Bottom) */}
                  <Text
                    style={styles.secondaryLocationText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {secondaryLocation || 'Tap to set address'}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* --------------------------------- */}

              {/* <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('EliteMembership')}
              >
                <Icon name="workspace-premium" size={30} color={COLORS.primary} />
              </TouchableOpacity> */}
            </View>

            <View style={styles.heroSection}>
              {/* <Text style={styles.heroTitle}>Fresh, Fast & Delivered</Text>
            <Text style={styles.heroSubtitle}>
              The best quality meat, delivered to your doorstep.
            </Text> */}
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <Icon
                name="search"
                size={24}
                color={COLORS.muted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for chicken, meat, or dishes…"
                placeholderTextColor={COLORS.muted}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
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
  headerContainer: {
    // backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 48,
    position: 'relative',
    overflow: 'hidden',
    height: 350,
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: 'relative',
    zIndex: 10,
  },
  // --- Location Styles ---
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryLocationText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 4,
    maxWidth: '80%',
  },
  secondaryLocationText: {
    color: COLORS.primary,
    // Reduced font size so more text fits before truncating
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    maxWidth: '90%',
  },
  // -------------------------------
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 100,
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  heroTitle: {
    color: COLORS.background,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: -24,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingHorizontal: 8,
  },
  searchIcon: {
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
  },
  mainContent: {
    paddingTop: 32,
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