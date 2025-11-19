// DealsScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AxiosError } from 'axios';
import Alert from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts } from '../../services/product.service';
import { useCartStore } from '../../store/cart';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { ErrorMessage } from '../../utils/utils';
import ProductCard from '../../components/ui/products/DiscountProduct';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const initialVideoHeight = screenHeight * 0.4;

const DealsScreen = ({ navigation }: AppNavigation) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoHeight, setVideoHeight] = useState<number>(initialVideoHeight);
  const { latitude, longitude } = useLocationStore();
  const { userId, isAuthenticated } = useAuth();
  const { addToCart } = useCartStore();

  const fetchDiscountProducts = async () => {
    try {
      setIsLoading(true);
      const res = await getAllProducts({
        isActive: true,
        lat: latitude ?? undefined,
        lng: longitude ?? undefined,
        userId: userId ?? undefined,
        marketPrice: 1
      });
      setProducts(res.data.products);
      console.log(res.data);
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountProducts();
  }, [latitude, longitude, userId]);

  const handleNavigateToDetails = (product: Product) => {
    navigation.navigate("ProductDetails", { product });
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      Alert.Alert.alert(
        "Login Required",
        "You need to log in to add this product to your cart.",
        [
          { text: "Login", onPress: () => navigation.navigate("Login") },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    try {
      await addToCart(productId, quantity);
      Toast.show({
        type: 'success',
        text1: 'Added to cart!',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          type: 'error',
          text1: error.response?.data?.message || 'Failed to add to cart',
        });
      } else {
        ErrorMessage(error as AxiosError | Error);
      }
    }
  };

  // Video source
  // const videoSource = {
  //   uri: 'https://assets.mixkit.co/videos/preview/mixkit-hand-of-a-man-slicing-a-fresh-salmon-fillet-43405-large.mp4',
  // };

  const chunkArray = (array: Product[], chunkSize: number): Product[][] => {
    return array.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, [] as Product[][]);
  };

  const productChunks = chunkArray(products, 2);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Header */}
        <View style={[styles.videoHeader, { height: videoHeight }]}>
          <Image
            source={require('../../assets/discount/discount.png')} // Replace with your image path, e.g., require('../../assets/images/discount-bg.jpg')
            style={styles.video}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Exclusive Discounts</Text>
            <Text style={styles.headerSubtitle}>Fresh Deals, Unbeatable Prices</Text>
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.grid}>
          {productChunks.map((rowProducts, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {rowProducts.map((product, colIndex) => {
                const cardStyle = colIndex === 0 ? [styles.card, { marginRight: 16 }] : styles.card;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    handleNavigateToDetails={handleNavigateToDetails}
                    handleAddToCart={handleAddToCart}
                    isAuthenticated={isAuthenticated}
                    style={cardStyle}
                  />
                );
              })}
              {rowProducts.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 96, // Space for bottom nav
  },
  scrollContent: {
    paddingBottom: 24,
  },
  videoHeader: {
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
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
  headerContent: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  grid: {
    padding: 16,
    marginBottom: 25,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    // Base card style (overridden by ProductCard styles)
  },
});

export default DealsScreen;