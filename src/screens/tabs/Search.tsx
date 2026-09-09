import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { InlineLoading } from '../../components/ui/loader/InlineLoading';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { useLocationStore } from '../../store/location';
import { COLORS, FONTS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';

const { width, height } = Dimensions.get('window');

const SearchScreen = ({ navigation }: AppNavigation) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const inputRef = useRef<TextInput>(null);
  const { latitude, longitude } = useLocationStore();

  const TRENDING = [
    { id: '1', name: 'Chicken', icon: 'restaurant' },
    { id: '2', name: 'Fish', icon: 'water' },
    { id: '3', name: 'Mutton', icon: 'outdoor-grill' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const querySearch = debouncedSearch.trim();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
    error,
  } = useGetAllProducts(
    {
      search: querySearch,
      lat: latitude ?? undefined,
      lng: longitude ?? undefined,
      limit: 15,
    },
    {
      enabled: querySearch.length > 0,
    }
  );

  const products = querySearch.length > 0
    ? data?.pages.flatMap(page => page.products) || []
    : [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.en || value['en'] || Object.values(value)[0] || JSON.stringify(value);
    }
    return String(value) || 'Unknown';
  };

  const clearSearch = () => {
    setSearchText('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const originalPrice = parseToDecimal(item.marketPrice);
    const sellingPrice = parseToDecimal(item.sellingPrice);
    const discount = originalPrice > sellingPrice 
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) 
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => handleProductPress(item)}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images[0]?.image.url || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          {discount > 0 && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>{discount}% OFF</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productDetails}>
          <View>
            <Text style={styles.itemName} numberOfLines={1}>
              {getStringValue(item.name)}
            </Text>
            <Text style={styles.itemMeta} numberOfLines={1}>
              {getStringValue(item.weight)} {item.pieces ? `• ${getStringValue(item.pieces)} pcs` : ''}
            </Text>
          </View>
          
          <View style={styles.priceActionRow}>
            <View>
              <Text style={styles.priceTag}>₹{sellingPrice.toFixed(0)}</Text>
              {discount > 0 && (
                <Text style={styles.oldPrice}>₹{originalPrice.toFixed(0)}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.addBtnSmall}
              onPress={() => handleProductPress(item)}
            >
              <Text style={styles.addBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Fixed Top Section */}
        <View style={styles.topSection}>
          <LinearGradient
            colors={[COLORS.primary, '#802BB1']}
            style={styles.headerGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.navRow}>
              <TouchableOpacity 
                style={styles.circleBack} 
                onPress={() => navigation.goBack()}
              >
                <Icon name="chevron-left" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Search</Text>
            </View>

            <View style={styles.searchBox}>
              <Icon name="search" size={22} color={COLORS.muted} />
              <TextInput
                ref={inputRef}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search chicken, meat, fish..."
                placeholderTextColor="#94A3B8"
                style={styles.inputField}
                selectionColor={COLORS.primary}
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                  <Icon name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Dynamic Content Area */}
        <View style={styles.contentArea}>
          {querySearch.length > 0 && isLoading ? (
            <View style={styles.fullCenter}>
              <InlineLoading visible />
              <Text style={styles.mutedLabel}>Looking for results...</Text>
            </View>
          ) : querySearch.length > 0 && isError ? (
            <View style={styles.fullCenter}>
              <View style={styles.errorCircle}>
                <Icon name="wifi-off" size={40} color="#F87171" />
              </View>
              <Text style={styles.errorMsg}>
                {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
              </Text>
              <TouchableOpacity style={styles.actBtn} onPress={() => refetch()}>
                <Text style={styles.actBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : querySearch.length === 0 ? (
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.introBox}>
                <View style={styles.heroDeco}>
                  <Icon name="set-meal" size={50} color={COLORS.primary} />
                </View>
                <Text style={styles.introTitle}>Craving something fresh?</Text>
                <Text style={styles.introSub}>Search and order premium quality meat delivered in 30 mins.</Text>
                
                <View style={styles.trendingSection}>
                  <Text style={styles.sectionHeading}>Trending Searches</Text>
                  <View style={styles.trendingGrid}>
                    {TRENDING.map(item => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.trendChip}
                        onPress={() => {
                          setSearchText(item.name);
                          setDebouncedSearch(item.name);
                        }}
                      >
                        <Icon name={item.icon} size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.trendText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.emptyIllustrationSpace} />
              </View>
            </ScrollView>
          ) : products.length === 0 ? (
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.fullCenter}>
                <Icon name="sentiment-dissatisfied" size={70} color="#CBD5E1" />
                <Text style={styles.emptyHead}>No matches found</Text>
                <Text style={styles.emptySide}>We couldn't find "{searchText}". Please try another keyword.</Text>
                <TouchableOpacity style={styles.ghostBtn} onPress={clearSearch}>
                  <Text style={styles.ghostBtnText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.itemList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  topSection: {
    backgroundColor: '#F8FAFC',
  },
  headerGrad: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingLeft: 12,
    fontWeight: '600',
  },
  clearIcon: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 50,
  },
  itemList: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 95,
    height: 95,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  promoBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  promoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceTag: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  oldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  addBtnSmall: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  fullCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introBox: {
    alignItems: 'center',
  },
  heroDeco: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  introSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  trendingSection: {
    marginTop: 40,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  trendText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyIllustrationSpace: {
    height: 100,
  },
  emptyHead: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 20,
  },
  emptySide: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  ghostBtn: {
    marginTop: 24,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghostBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  mutedLabel: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorMsg: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  actBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchScreen;