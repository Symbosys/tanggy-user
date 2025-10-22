import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ToastAndroid } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderAddress from '../../components/home/Header';
import WelcomeBanner from '../../components/home/WelcomeBanner';
import WelcomeRewards from '../../components/home/WelcomeRewards';
import { AppNavigation } from '../../types/type';
import { getAllBestSellerProducts } from '../../services/product.service';
import { AxiosError } from 'axios';
import { ErrorMessage } from '../../utils/utils';
import { Product } from '../../types/product.type';
import ProductCard from '../../components/ui/Product';
import ShopByCategory from '../../components/home/ShopByCategory';
import { useLocationStore } from '../../store/location';

export default function HomeScreen({ navigation }: AppNavigation) {
  const insets = useSafeAreaInsets();
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const { latitude, longitude } = useLocationStore()

  useEffect(() => {
    const fetchBestSellerProducts = async () => {
      try {
        const response = await getAllBestSellerProducts({lat: latitude ?? undefined, lng: longitude ?? undefined, isActive: true});
        console.log("🚀 ~ file: Home.tsx ~ line 32 ~ fetchBestSellerProducts ~ response", response.data.products);
        setBestSellerProducts(response.data.products)
      } catch (error) {
        ErrorMessage(error as AxiosError | Error);
      }
    }
    fetchBestSellerProducts()
  },[latitude, longitude])
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <HeaderAddress navigation={navigation} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}>
          <WelcomeBanner />
          <WelcomeRewards />

          {/* BestSeller Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bestsellers</Text>
            <Text style={styles.sectionSubtitle}>
              Most popular products near you!
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} >
              {
                bestSellerProducts && bestSellerProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} navigation={navigation} />
                ))
              }
            </ScrollView>
          </View>

          {/* Shop By Category */}
          <ShopByCategory />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },

  // BestSeller Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});
