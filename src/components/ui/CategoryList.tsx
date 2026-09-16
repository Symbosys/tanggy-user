import React, { useState } from 'react';
import {
  Dimensions,
  Image,
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
const ITEM_WIDTH = Math.max(68, (SCREEN_WIDTH - 24) / 5);

interface CategoryListProps {
  categories: Category[];
  navigation: AppNavigation['navigation'];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, navigation }) => {
  const [scrollX, setScrollX] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string>('all');

  const allCategory: Category = {
    id: 'all',
    name: 'All',
    image: { url: '', public_id: '', secure_url: '' },
  };

  const hasAll = (categories || []).some(
    (c) => c.name?.toLowerCase() === 'all'
  );
  const categoryItems: Category[] = hasAll
    ? categories
    : [allCategory, ...(categories || [])];

  const handleCategoryPress = (categoryItem: Category) => {
    setSelectedId(categoryItem.id);
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
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        {categoryItems.map((categoryItem, index) => {
          // Dynamic Parabolic Arc calculation: centered item is highest, side items curve down
          const itemCenter = 12 + index * ITEM_WIDTH + ITEM_WIDTH / 2;
          const viewportCenter = scrollX + SCREEN_WIDTH / 2;
          const dist = Math.abs(itemCenter - viewportCenter);
          const maxDist = SCREEN_WIDTH / 2;
          const normDist = Math.min(dist / maxDist, 1);
          const translateY = Math.pow(normDist, 1.6) * 22;
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
                  transform: [{ translateY }],
                },
              ]}
              onPress={() => handleCategoryPress(categoryItem)}
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

              {isSelected && <View style={styles.activeIndicator} />}

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
    paddingTop: 8,
    paddingBottom: 22,
    marginTop: 6,
  },
  arcMound: {
    position: 'absolute',
    top: 18,
    left: -SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 1.5,
    height: 220,
    borderRadius: SCREEN_WIDTH * 0.75,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    minHeight: 110,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  categoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  categoryCircleSelected: {
    borderColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 0.14,
    elevation: 4,
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
    color: '#71717A',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#18181B',
    fontWeight: '800',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#18181B',
    marginTop: 4,
  },
  minutesBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: '#FF7622',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  minutesText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CategoryList;