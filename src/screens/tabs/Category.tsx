import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import api from '../../api/api';
import { Category } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { useAuth } from '../../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 32 - 16) / 2; // Adjust for gap-4 (16px total gap)
const cardMinHeight = 260;

const ExploreCategories = ({ navigation }: AppNavigation) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/category/all');
      setCategories(res.data.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          type: 'error',
          text1: error.response?.data.message || "Something went wrong",
        });
      } else {
        Toast.show({
          type: 'error',
          text1: "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore Categories</Text>
          <Text style={styles.subtitle}>Discover fresh meat and seafood selections</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8719C6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Categories</Text>
        <Text style={styles.subtitle}>Discover fresh meat and seafood selections</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <View
              key={cat.id || index}
              style={[
                styles.cardWrapper,
                { width: itemWidth, minHeight: cardMinHeight, marginBottom: 16 },
              ]}>
              <LinearGradient
                colors={['#f9eae9', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: cat.image.url }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.categoryTitle}>{cat.name}</Text>
                  <LinearGradient
                    colors={['#8719C6', '#b58ff0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}>
                    <TouchableOpacity
                      style={styles.buttonTouchable}
                      onPress={() => navigation.navigate('CategoryResults', { categoryId: cat.id, categoryName: cat.name })}
                    >
                      <Text style={styles.buttonText}>View Products</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6f8',
  },
  header: {
    flexDirection: 'column',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#f7f6f8',
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '700',
    color: '#1b1121',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    paddingBottom: 12,
    paddingTop: 4,
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    // Width and minHeight set inline
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },

  textContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonGradient: {
    width: '100%',
    height: 40,
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 12,
  },
  buttonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default ExploreCategories;