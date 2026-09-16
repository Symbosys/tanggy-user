import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { Category } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 76;
const SIDE_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

interface CategoryListProps {
  categories: Category[];
  navigation: AppNavigation['navigation'];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedId, setSelectedId] = useState<string>('all');

  const { categoryItems, allIndex } = useMemo(() => {
    const allCategory: Category = {
      id: 'all',
      name: 'All',
      image: { url: '', public_id: '', secure_url: '' },
    };

    const otherCategories = (categories || []).filter(
      (c) => c.name?.toLowerCase() !== 'all'
    );

    // Place "All" in the center with other categories distributed on both sides
    const half = Math.ceil(otherCategories.length / 2);
    const leftCategories = otherCategories.slice(0, half);
    const rightCategories = otherCategories.slice(half);
    const items = [...leftCategories, allCategory, ...rightCategories];
    const index = leftCategories.length;

    return { categoryItems: items, allIndex: index };
  }, [categories]);

  const [scrollX, setScrollX] = useState<number>(allIndex * ITEM_WIDTH);

  // Center "All" on mount and whenever categories change
  useEffect(() => {
    setScrollX(allIndex * ITEM_WIDTH);
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: allIndex * ITEM_WIDTH,
        animated: false,
      });
    }, 60);
    return () => clearTimeout(timeout);
  }, [allIndex]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    setScrollX(offsetX);
    const centerIndex = Math.round(offsetX / ITEM_WIDTH);
    if (categoryItems[centerIndex] && categoryItems[centerIndex].id !== selectedId) {
      setSelectedId(categoryItems[centerIndex].id);
    }
  };

  const handleCategoryPress = (categoryItem: Category, index: number) => {
    setSelectedId(categoryItem.id);
    scrollViewRef.current?.scrollTo({ x: index * ITEM_WIDTH, animated: true });
    if (categoryItem.id === 'all') {
      navigation.navigate('Category');
    } else {
      navigation.navigate('CategoryResults', {
        categoryId: categoryItem.id,
        categoryName: categoryItem.name,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.arcMound} />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: SIDE_PADDING },
        ]}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {categoryItems.map((categoryItem, index) => {
          // Dynamic Parabolic Arc calculation: centered item is elevated at peak, side items tilt downward on both sides
          const itemCenter = SIDE_PADDING + index * ITEM_WIDTH + ITEM_WIDTH / 2;
          const viewportCenter = scrollX + SCREEN_WIDTH / 2;
          const dist = Math.abs(itemCenter - viewportCenter);
          const maxDist = SCREEN_WIDTH / 2;
          const normDist = Math.min(dist / maxDist, 1);
          const translateY = Math.pow(normDist, 1.4) * 36;
          const scale = Math.max(0.85, 1.08 - normDist * 0.22);
          const isSelected = selectedId === categoryItem.id;
          const imageUrl =
            categoryItem.image?.secure_url || categoryItem.image?.url;

          return (
            <TouchableOpacity
              key={categoryItem.id || String(index)}
              style={[
                styles.categoryItem,
                {
                  width: ITEM_WIDTH,
                  transform: [{ translateY }, { scale }],
                },
              ]}
              onPress={() => handleCategoryPress(categoryItem, index)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.categoryCircle,
                  isSelected && styles.categoryCircleSelected,
                ]}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon
                    name={categoryItem.id === 'all' ? 'restaurant' : 'fastfood'}
                    size={26}
                    color={COLORS.primary}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
                numberOfLines={1}
              >
                {categoryItem.name}
              </Text>

              {isSelected ? (
                <View style={styles.activeIndicator} />
              ) : (
                <View style={styles.activeIndicatorPlaceholder} />
              )}

              {categoryItem.name === 'Heat & Eat' && (
                <View style={styles.minutesBadge}>
                  <Text style={styles.minutesText}>2 mins</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 22,
    marginTop: 4,
  },
  arcMound: {
    position: 'absolute',
    top: 18,
    left: -SCREEN_WIDTH * 0.4,
    width: SCREEN_WIDTH * 1.8,
    height: 280,
    borderRadius: SCREEN_WIDTH * 0.9,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    alignItems: 'flex-start',
    minHeight: 125,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  categoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryCircleSelected: {
    borderColor: COLORS.primaryLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 5,
    backgroundColor: COLORS.surface,
  },
  categoryImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  categoryName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  activeIndicator: {
    width: 22,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: COLORS.textPrimary,
    marginTop: 4,
  },
  activeIndicatorPlaceholder: {
    width: 22,
    height: 3.5,
    marginTop: 4,
  },
  minutesBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  minutesText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default CategoryList;