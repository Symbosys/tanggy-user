import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';
import { getAllProducts } from '../../services/product.service';
import { LoadingOverlay } from '../../components/ui/loader/LoaderOverLay';
import { InlineLoading } from '../../components/ui/loader/InlineLoading';

const SearchScreen = ({ navigation }: AppNavigation) => {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const darkPrimary = '#7a2cc3'; // Darker shade for gradients

  // Function to safely extract string value from potentially object fields
  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // Try common language keys like 'en'
      return value.en || value['en'] || Object.values(value)[0] || JSON.stringify(value);
    }
    return String(value) || 'Unknown';
  };

  const fetchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getAllProducts({ search: query });
      console.log("search data", response.data.products)
      if (response.success) {
        setProducts(response.data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Proper debounce implementation using useRef
  const timeoutRef = useRef<any | null>(null);
  const debouncedFetch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchProducts(query);
    }, 1000);
  }, [fetchProducts]);

  useEffect(() => {
    debouncedFetch(searchText);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText, debouncedFetch]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(135, 25, 198, 0.1)',
        marginTop: 20,
      }}
      activeOpacity={0.9}
      onPress={() => handleProductPress(item)}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
        <Image
          source={{ uri: item.images[0]?.image.url || '' }}
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
        />
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: COLORS.textPrimary,
            marginBottom: 4,
            lineHeight: 22,
          }}
          numberOfLines={2}>
          {getStringValue(item.name)}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: COLORS.muted,
            marginBottom: 8,
            lineHeight: 18,
          }}
          numberOfLines={1}>
          {getStringValue(item.weight)} {item.pieces ? `| ${getStringValue(item.pieces)}` : ''}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: COLORS.primary,
              lineHeight: 24,
            }}>
            ₹{parseToDecimal(item.sellingPrice).toFixed(2)}
          </Text>
          {item.marketPrice && item.marketPrice > item.sellingPrice && (
            <Text
              style={{
                fontSize: 14,
                color: COLORS.muted,
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
              }}>
              ₹{parseToDecimal(item.marketPrice).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: COLORS.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <Icon name="arrow-forward" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {/* Sticky Top Search Bar */}
        <View
          style={{
            position: 'relative',
            zIndex: 20,
            backgroundColor: COLORS.background,
            paddingTop: 16,
            paddingBottom: 16,
            paddingHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 9999,
                height: 48,
                paddingHorizontal: 16,
              }}>
              <Icon name="search" size={24} color={COLORS.muted} />
              <TextInput
                autoFocus={true}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search for chicken, meat, or dishes..."
                placeholderTextColor={COLORS.muted}
                style={{
                  flex: 1,
                  paddingVertical: 0,
                  marginLeft: 8,
                  fontSize: 16,
                  color: "black",
                }}
              />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <InlineLoading visible />
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
              <Text style={{ fontSize: 16, color: COLORS.muted, textAlign: 'center' }}>
                {error}
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                }}
                onPress={() => setSearchText('')}>
                <Text style={{ color: 'white', fontWeight: '800' }}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
              {searchText.trim() === '' ? (
                <>
                  <Icon name="search" size={80} color={COLORS.muted} />
                  <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 24, textAlign: 'center' }}>
                    Search Your Favorite Products
                  </Text>
                  <Text style={{ fontSize: 16, color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                    Discover fresh chicken, mutton, fish, and more. Start typing to explore!
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="search-off" size={64} color={COLORS.muted} />
                  <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 16 }}>
                    No products found
                  </Text>
                  <Text style={{ fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 8 }}>
                    Try searching for something else
                  </Text>
                </>
              )}
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;