import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api/api';
import { Category } from '../../types/product.type';
import { AppNavigation } from '../../types/type';

const {width} = Dimensions.get('window');

const ShopByCategory = ({ navigation }: AppNavigation) => {
  const [category, setCategory] = useState<Category[]>([]);

  const fetchCategory = async () => {
    try {
      const res = await api.get('/category/all');
      setCategory(res.data.data);
    } catch (error) {
      if(error instanceof AxiosError){
        Toast.show({
          type: 'error',
          text1: error.response?.data.message || "Something went wrong",
        })
      } else {
        Toast.show({
          type: 'error',
          text1: "Something went wrong",
        })
      }
    }
  }

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shop by category</Text>
      <Text style={styles.sectionSubtitle}>Freshest meats and much more!</Text>
      <View style={styles.categoryGrid}>
        {category.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryItem} onPress={() => navigation.navigate("CategoryResults")}>
            <Image source={{uri: category.image.url}} style={styles.categoryImage} />
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.name === 'Heat & Eat' && (
              <View style={styles.minutesBadge}>
                <Text style={styles.minutesText}>2 mins</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 48) / 4,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '900',
  },
  minutesBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
    backgroundColor: '#FF7622',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  minutesText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ShopByCategory;
