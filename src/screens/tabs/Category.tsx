import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useGetAllCategories } from '../../api/hooks/useCategory';
import { useModeStore } from '../../store/mode';
import { COLORS } from '../../theme/theme';
import { Category } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 14;
const itemWidth = (screenWidth - 32 - CARD_GAP) / 2;

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('burger')) return 'lunch-dining';
  if (lower.includes('pizza')) return 'local-pizza';
  if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('chinese'))
    return 'ramen-dining';
  if (lower.includes('dessert') || lower.includes('cake') || lower.includes('sweet'))
    return 'cake';
  if (
    lower.includes('beverage') ||
    lower.includes('drink') ||
    lower.includes('juice') ||
    lower.includes('shake')
  )
    return 'local-drink';
  if (lower.includes('biryani') || lower.includes('rice') || lower.includes('bhat'))
    return 'rice-bowl';
  if (
    lower.includes('chicken') ||
    lower.includes('meat') ||
    lower.includes('curry') ||
    lower.includes('mutton') ||
    lower.includes('fish')
  )
    return 'set-meal';
  if (
    lower.includes('snack') ||
    lower.includes('starter') ||
    lower.includes('fry') ||
    lower.includes('fries')
  )
    return 'fastfood';
  return 'restaurant';
};

const getCategorySubtitle = (cat: Category) => {
  if (cat.description && cat.description.trim().length > 0) {
    return cat.description;
  }
  const lower = cat.name.toLowerCase();
  if (lower.includes('burger')) return 'Juicy bites, always a good idea';
  if (lower.includes('pizza')) return 'Made to share, always a favourite';
  if (lower.includes('noodle') || lower.includes('chinese'))
    return 'Comfort in every bowl';
  if (lower.includes('dessert') || lower.includes('sweet'))
    return 'Sweet moments always';
  if (lower.includes('beverage') || lower.includes('drink'))
    return 'Cool sips for brighter days';
  if (lower.includes('biryani') || lower.includes('rice'))
    return 'Aromatic & rich flavours';
  if (lower.includes('chicken') || lower.includes('meat'))
    return 'Tender & fresh cuts';
  return 'Fresh flavours for every moment';
};

const ExploreCategories = ({ navigation }: AppNavigation) => {
  const { selectedMode } = useModeStore();
  const {
    data: categories = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllCategories(
    { modeId: selectedMode?.id },
    { enabled: Boolean(selectedMode?.id) }
  );

  if (isLoading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>
            Explore our delicious food categories
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo/LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>
          {selectedMode
            ? `Explore our ${selectedMode.name.toLowerCase()} categories`
            : 'Explore our delicious food categories'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isFetching && !isLoading)}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="category" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              No categories available in this mode
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {categories.map((cat, index) => {
              const imageUrl = cat.image?.secure_url || cat.image?.url;
              const iconName = getCategoryIcon(cat.name);
              const subtitle = getCategorySubtitle(cat);

              return (
                <TouchableOpacity
                  key={cat.id || String(index)}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate('CategoryResults', {
                      categoryId: cat.id,
                      categoryName: cat.name,
                    })
                  }
                  style={[styles.cardWrapper, { width: itemWidth }]}
                >
                  <View style={styles.card}>
                    {/* Left Info Column */}
                    <View style={styles.cardLeft}>
                      {/* Icon Badge */}
                      <View style={styles.iconCircle}>
                        <MaterialIcons
                          name={iconName}
                          size={22}
                          color={COLORS.primary}
                        />
                      </View>

                      {/* Title & Subtitle */}
                      <View style={styles.textBlock}>
                        <Text style={styles.categoryTitle} numberOfLines={1}>
                          {cat.name}
                        </Text>
                        <Text style={styles.categorySubtitle} numberOfLines={2}>
                          {subtitle}
                        </Text>
                      </View>

                      {/* Arrow Action Button */}
                      <View style={styles.arrowCircle}>
                        <MaterialIcons
                          name="arrow-forward"
                          size={14}
                          color={COLORS.primary}
                        />
                      </View>
                    </View>

                    {/* Right Product Image */}
                    <View style={styles.cardRight}>
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.categoryImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <MaterialIcons
                            name="restaurant"
                            size={32}
                            color="#E2E8F0"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
  },
  logo: {
    width: 350,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.muted,
    lineHeight: 20,
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
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: CARD_GAP,
  },
  cardWrapper: {
    marginBottom: 2,
  },
  card: {
    height: 165,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  cardLeft: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    zIndex: 2,
    maxWidth: '56%',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    marginVertical: 4,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 10.5,
    color: COLORS.muted,
    fontWeight: '500',
    lineHeight: 14,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardRight: {
    position: 'absolute',
    right: -14,
    top: 10,
    bottom: 10,
    width: '54%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryImage: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: COLORS.background,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
  },
});

export default ExploreCategories;