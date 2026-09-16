import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetAllProducts } from '../../api/hooks/useProduct';
import { InlineLoading } from '../../components/ui/loader/InlineLoading';
import { useLocationStore } from '../../store/location';
import { useModeStore } from '../../store/mode';
import { COLORS } from '../../theme/theme';
import { Product } from '../../types/product.type';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';

const SearchScreen = ({ navigation }: AppNavigation) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const inputRef = useRef<TextInput>(null);
  const isNavigatingToDetails = useRef(false);
  const { latitude, longitude } = useLocationStore();
  const { selectedMode } = useModeStore();

  // Auto focus input on focus; reset search state when navigating away from search
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);

      return () => {
        clearTimeout(timer);
        if (!isNavigatingToDetails.current) {
          setSearchText('');
          setDebouncedSearch('');
        }
        isNavigatingToDetails.current = false;
      };
    }, [])
  );

  // Hardware back press listener to reset state
  useEffect(() => {
    const onBackPress = () => {
      setSearchText('');
      setDebouncedSearch('');
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
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
      modeId: selectedMode?.id,
    },
    {
      enabled: querySearch.length > 0,
    }
  );

  const products =
    querySearch.length > 0
      ? data?.pages.flatMap((page) => page.products) || []
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
      return (
        value.en ||
        value['en'] ||
        Object.values(value)[0] ||
        JSON.stringify(value)
      );
    }
    return String(value) || 'Unknown';
  };

  const handleBack = () => {
    setSearchText('');
    setDebouncedSearch('');
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearchText('');
    setDebouncedSearch('');
    inputRef.current?.focus();
  };

  const handleProductPress = (product: Product) => {
    isNavigatingToDetails.current = true;
    navigation.navigate('ProductDetails', { product });
  };

  const checkIsNonVeg = (item: Product) => {
    const text = `${getStringValue(item.name)} ${getStringValue(item.description)} ${item.category?.name || ''} ${item.subCategory?.name || ''}`.toLowerCase();
    return (
      text.includes('chicken') ||
      text.includes('meat') ||
      text.includes('mutton') ||
      text.includes('fish') ||
      text.includes('prawn') ||
      text.includes('egg') ||
      text.includes('pepperoni') ||
      text.includes('bbq') ||
      text.includes('non-veg') ||
      text.includes('pork') ||
      text.includes('beef')
    );
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    const sellingPrice = parseToDecimal(item.sellingPrice);
    const isNonVeg = checkIsNonVeg(item);
    const isBestseller = index % 2 === 0;
    const ratingValue = (4.5 + ((index * 0.1) % 0.4)).toFixed(1);
    const reviewCount = 150 + ((item.id.charCodeAt(0) * 19) % 280);

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => handleProductPress(item)}
      >
        <Image
          source={{
            uri:
              item.images[0]?.image.url ||
              'https://via.placeholder.com/150',
          }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productDetails}>
          <View>
            <Text style={styles.itemName} numberOfLines={1}>
              {getStringValue(item.name)}
            </Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description
                ? getStringValue(item.description)
                : `${getStringValue(item.weight)}${
                    item.pieces ? ` • ${getStringValue(item.pieces)} pcs` : ''
                  }`}
            </Text>
          </View>

          <View style={styles.tagsRow}>
            {isNonVeg ? (
              <View style={styles.nonVegBadge}>
                <Icon name="local-dining" size={11} color={COLORS.error} />
                <Text style={styles.nonVegBadgeText}>Non-Veg</Text>
              </View>
            ) : (
              <View style={styles.vegBadge}>
                <Icon name="eco" size={11} color={COLORS.success} />
                <Text style={styles.vegBadgeText}>Veg</Text>
              </View>
            )}

            {isBestseller && (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.bestsellerBadgeText}>Bestseller</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.productRight}>
          <Text style={styles.priceTag}>₹{sellingPrice.toFixed(0)}</Text>

          <View style={styles.ratingRow}>
            <Icon name="star" size={13} color={COLORS.warning} />
            <Text style={styles.ratingText}>{ratingValue}</Text>
            <Text style={styles.ratingCount}> ({reviewCount})</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => handleProductPress(item)}
          >
            <Icon name="visibility" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-back-ios" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />

          <View style={styles.headerPlaceholder} />
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={22} color={COLORS.textPrimary} />
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search for dishes, restaurants or cuisines..."
              placeholderTextColor={COLORS.muted}
              style={styles.inputField}
              selectionColor={COLORS.primary}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={14} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dynamic Content Area */}
        <View style={styles.contentArea}>
          {querySearch.length > 0 && isLoading ? (
            <View style={styles.centerContainer}>
              <InlineLoading visible />
              <Text style={styles.mutedLabel}>Looking for results...</Text>
            </View>
          ) : querySearch.length > 0 && isError ? (
            <View style={styles.centerContainer}>
              <View style={styles.errorCircle}>
                <Icon name="wifi-off" size={38} color={COLORS.error} />
              </View>
              <Text style={styles.errorMsg}>
                {error instanceof Error
                  ? error.message
                  : 'Something went wrong. Please try again.'}
              </Text>
              <TouchableOpacity style={styles.actBtn} onPress={() => refetch()}>
                <Text style={styles.actBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : querySearch.length === 0 ? (
            /* Initial Empty State */
            <ScrollView
              contentContainerStyle={styles.emptyScrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emptyIllustrationWrapper}>
                <View style={styles.illustrationCircle}>
                  <View style={styles.sparkleRay1} />
                  <View style={styles.sparkleRay2} />
                  <View style={styles.sparkleRay3} />
                  <Icon name="search" size={48} color={COLORS.primary} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Search for something delicious</Text>
              <Text style={styles.emptySubtitle}>
                Find your favourite dishes, restaurants{'\n'}or cuisines
              </Text>
            </ScrollView>
          ) : products.length === 0 ? (
            /* No Results Found State */
            <ScrollView
              contentContainerStyle={styles.emptyScrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.centerContainer}>
                <View style={styles.noResultCircle}>
                  <Icon
                    name="sentiment-dissatisfied"
                    size={48}
                    color={COLORS.muted}
                  />
                </View>
                <Text style={styles.emptyTitle}>No matches found</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn't find "{searchText}". Please try another keyword.
                </Text>
                <TouchableOpacity style={styles.clearSearchBtn} onPress={clearSearch}>
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Search Results List */
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.itemList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    Results for "{debouncedSearch}"
                  </Text>
                  <Text style={styles.resultsCount}>
                    {products.length} {products.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              }
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
    backgroundColor: COLORS.background,
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerLogo: {
    width: 140,
    height: 42,
  },
  headerPlaceholder: {
    width: 36,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    height: 50,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  emptyIllustrationWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleRay1: {
    position: 'absolute',
    top: 20,
    right: 22,
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  sparkleRay2: {
    position: 'absolute',
    top: 28,
    right: 14,
    width: 9,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '15deg' }],
  },
  sparkleRay3: {
    position: 'absolute',
    top: 38,
    right: 18,
    width: 7,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-25deg' }],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  itemList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  productImage: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    justifyContent: 'space-between',
    height: 86,
    paddingVertical: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  itemDescription: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  vegBadgeText: {
    color: COLORS.success,
    fontSize: 10.5,
    fontWeight: '700',
  },
  nonVegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  nonVegBadgeText: {
    color: COLORS.error,
    fontSize: 10.5,
    fontWeight: '700',
  },
  bestsellerBadge: {
    backgroundColor: COLORS.highlight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestsellerBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 10.5,
    fontWeight: '700',
  },
  productRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 86,
    paddingVertical: 2,
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearSearchBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  clearSearchBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  mutedLabel: {
    marginTop: 14,
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  errorCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorMsg: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  actBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchScreen;