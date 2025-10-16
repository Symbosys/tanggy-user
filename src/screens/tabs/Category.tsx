// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   Dimensions,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// const { width } = Dimensions.get('window');

// const EggsCategoryScreen = () => {
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [activeImageIndex, setActiveImageIndex] = useState(0);

//   const categories = [
//     {
//       id: '1',
//       name: 'All',
//       image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNoaWNrZW58ZW58MHx8MHx8fDA%3D',
//     },
//     {
//       id: '2',
//       name: 'Classic Eggs',
//       image: 'https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.webp?a=1&b=1&s=612x612&w=0&k=20&c=a8j_p9BkWtsSX7WkcqeetigH8PYWXGayIGto9GiehNY=',
//     },
//     {
//       id: '3',
//       name: 'Speciality Eggs',
//       image: 'https://media.istockphoto.com/id/1265209311/photo/fried-chicken-kebab-or-kabab.webp?a=1&b=1&s=612x612&w=0&k=20&c=k6elu7ogARiXzPbHTFtCqEg2A4HQ1w-FR0kbpM8Hc_Q=',
//     },
//     {
//       id: '4',
//       name: 'Organic',
//       image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D',
//     },
//   ];

//   const productImages = [
//     'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D',

//     'https://media.istockphoto.com/id/1265209311/photo/fried-chicken-kebab-or-kabab.webp?a=1&b=1&s=612x612&w=0&k=20&c=k6elu7ogARiXzPbHTFtCqEg2A4HQ1w-FR0kbpM8Hc_Q=',

//     'https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.webp?a=1&b=1&s=612x612&w=0&k=20&c=a8j_p9BkWtsSX7WkcqeetigH8PYWXGayIGto9GiehNY=',
//   ];

//   const renderCategoryItem = ({ item }) => {
//     const isSelected = selectedCategory === item.name;
//     return (
//       <TouchableOpacity
//         style={styles.categoryItem}
//         onPress={() => setSelectedCategory(item.name)}
//       >
//         <View style={[styles.categoryImageContainer, isSelected && styles.selectedCategoryImage]}>
//           <Image source={{ uri: item.image }} style={styles.categoryImage} />
//         </View>
//         <Text style={[styles.categoryName, isSelected && styles.selectedCategoryName]}>
//           {item.name}
//         </Text>
//         {isSelected && <View style={styles.categoryUnderline} />}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.headerButton}>
//           <Icon name="arrow-back" size={28} color="#333" />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Eggs</Text>
//           <Icon name="keyboard-arrow-down" size={28} color="#333" />
//         </View>
//         <TouchableOpacity style={styles.headerButton}>
//           <Icon name="search" size={28} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Info Banner */}
//         <View style={styles.infoBanner}>
//           <View style={styles.infoBannerTextContainer}>
//             <Text style={styles.infoBannerText}>Laid by birds raised on</Text>
//             <Text style={styles.infoBannerText}>biosecure farms</Text>
//           </View>
//           <Image
//             source={{ uri: 'https://via.placeholder.com/100x80/FFE4B5/000000?text=🐔' }}
//             style={styles.chickenImage}
//           />
//         </View>

//         {/* Category Dots Indicator */}
//         <View style={styles.dotsContainer}>
//           <View style={styles.dotActive} />
//           <View style={styles.dot} />
//           <View style={styles.dot} />
//         </View>

//         {/* Categories Horizontal List */}
//         <FlatList
//           data={categories}
//           renderItem={renderCategoryItem}
//           keyExtractor={(item) => item.id}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.categoriesList}
//         />

//         {/* Filters and Items Count */}
//         <View style={styles.filtersContainer}>
//           <TouchableOpacity style={styles.filtersButton}>
//             <MaterialCommunityIcons name="tune-variant" size={22} color="#333" />
//             <Text style={styles.filtersText}>Filters</Text>
//           </TouchableOpacity>
//           <Text style={styles.itemsCount}>6 items</Text>
//         </View>

//         {/* Product Card */}
//         <View style={styles.productCard}>
//           {/* Product Images Carousel */}
//           <View style={styles.productImageContainer}>
//             <Image
//               source={{ uri: productImages[activeImageIndex] }}
//               style={styles.productImage}
//               resizeMode="cover"
//             />
//             <View style={styles.bookmarkButton}>
//               <Icon name="bookmark-border" size={20} color="#8B4513" />
//             </View>

//             {/* Image Pagination Dots */}
//             <View style={styles.imagePaginationDots}>
//               {productImages.map((_, index) => (
//                 <View
//                   key={index}
//                   style={[
//                     styles.imageDot,
//                     activeImageIndex === index && styles.imageActiveDot,
//                   ]}
//                 />
//               ))}
//             </View>
//           </View>

//           {/* Product Info */}
//           <View style={styles.productInfo}>
//             <Text style={styles.productTitle}>Brown Eggs - Pack of 6</Text>
//             <Text style={styles.productDescription}>
//               Try eggs from a special breed of hens.
//             </Text>

//             {/* Product Details */}
//             <View style={styles.productDetails}>
//               <Text style={styles.productDetailText}>6 units</Text>
//               <Text style={styles.productDetailSeparator}>|</Text>
//               <Text style={styles.productDetailText}>6 pieces</Text>
//               <Text style={styles.productDetailSeparator}>|</Text>
//               <Text style={styles.productDetailText}>serves 3-4</Text>
//             </View>

//             {/* Delivery Time */}
//             <View style={styles.deliveryTimeContainer}>
//               <View style={styles.deliveryIconCircle}>
//                 <Icon name="bolt" size={18} color="#FF9800" />
//               </View>
//               <Text style={styles.deliveryTimeText}>Today in 90 mins</Text>
//             </View>

//             {/* Price and Add Button */}
//             <View style={styles.priceContainer}>
//               <View style={styles.priceLeftSection}>
//                 <View style={styles.priceRow}>
//                   <Text style={styles.currentPrice}>₹87</Text>
//                   <Text style={styles.originalPrice}>₹105</Text>
//                   <View style={styles.discountBadge}>
//                     <Text style={styles.discountText}>17% off</Text>
//                   </View>
//                 </View>
//                 <Text style={styles.specialPriceText}>Special Price for you</Text>
//               </View>
//               <View style={styles.addButtonSection}>
//                 <TouchableOpacity style={styles.addButton}>
//                   <Text style={styles.addButtonText}>Add</Text>
//                   <Icon name="add" size={22} color="#fff" />
//                 </TouchableOpacity>
//                 <Text style={styles.chooseMoreText}>Choose more</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         <View style={styles.bottomPadding} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFEFD5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#FFEFD5',
//   },
//   headerButton: {
//     padding: 4,
//   },
//   headerTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#333',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   infoBanner: {
//     backgroundColor: '#FFE4B5',
//     marginHorizontal: 16,
//     marginTop: 12,
//     borderRadius: 16,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   infoBannerTextContainer: {
//     flex: 1,
//   },
//   infoBannerText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#8B4513',
//     lineHeight: 26,
//   },
//   chickenImage: {
//     width: 100,
//     height: 80,
//     resizeMode: 'contain',
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 12,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#D3B8A0',
//     marginHorizontal: 4,
//   },
//   dotActive: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#8B4513',
//     marginHorizontal: 4,
//   },
//   categoriesList: {
//     paddingHorizontal: 16,
//     marginBottom: 20,
//   },
//   categoryItem: {
//     alignItems: 'center',
//     marginRight: 20,
//   },
//   categoryImageContainer: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//     // elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   selectedCategoryImage: {
//     borderWidth: 3,
//     borderColor: '#8B4513',
//   },
//   categoryImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   categoryName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//     textAlign: 'center',
//     maxWidth: 90,
//   },
//   selectedCategoryName: {
//     color: '#1a1a1a',
//     fontWeight: '700',
//   },
//   categoryUnderline: {
//     width: 40,
//     height: 3,
//     backgroundColor: '#C41E3A',
//     marginTop: 4,
//     borderRadius: 2,
//   },
//   filtersContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 20,
//   },
//   filtersButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   filtersText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 8,
//   },
//   itemsCount: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//   },
//   productCard: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   productImageContainer: {
//     width: '100%',
//     height: 280,
//     position: 'relative',
//   },
//   productImage: {
//     width: '100%',
//     height: '100%',
//   },
//   bookmarkButton: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   imagePaginationDots: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     marginHorizontal: 4,
//   },
//   imageActiveDot: {
//     backgroundColor: '#fff',
//     width: 8,
//   },
//   productInfo: {
//     padding: 16,
//   },
//   productTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 6,
//   },
//   productDescription: {
//     fontSize: 15,
//     color: '#999',
//     marginBottom: 12,
//   },
//   productDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   productDetailText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   productDetailSeparator: {
//     fontSize: 14,
//     color: '#ddd',
//     marginHorizontal: 8,
//   },
//   deliveryTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   deliveryIconCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#FFF3E0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   deliveryTimeText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },
//   priceLeftSection: {
//     flex: 1,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   currentPrice: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginRight: 8,
//   },
//   originalPrice: {
//     fontSize: 16,
//     color: '#999',
//     textDecorationLine: 'line-through',
//     marginRight: 8,
//   },
//   discountBadge: {
//     backgroundColor: '#00C853',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   discountText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '700',
//   },
//   specialPriceText: {
//     fontSize: 14,
//     color: '#00A651',
//     fontWeight: '700',
//   },
//   addButtonSection: {
//     alignItems: 'flex-end',
//   },
//   addButton: {
//     backgroundColor: '#D81B60',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 28,
//     paddingVertical: 12,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: '#D81B60',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 6,
//   },
//   addButtonText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//     marginRight: 8,
//   },
//   chooseMoreText: {
//     fontSize: 13,
//     color: '#999',
//     fontWeight: '500',
//   },
//   bottomPadding: {
//     height: 40,
//   },
// });

// export default EggsCategoryScreen;



import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const EggsCategoryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const bannerImages = [
    {
      id: 1,
      text1: 'Laid by birds raised on',
      text2: 'biosecure farms',
      image:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=60',
    },
    {
      id: 2,
      text1: 'Fresh from the farms',
      text2: 'delivered to your doorstep',
      image:
        'https://images.unsplash.com/photo-1615486369152-70bbfc92e9eb?w=600&auto=format&fit=crop&q=60',
    },
    {
      id: 3,
      text1: 'High-quality organic eggs',
      text2: 'for your daily nutrition',
      image:
        'https://images.unsplash.com/photo-1570197788417-0e82375c9378?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const categories = [
    {
      id: '1',
      name: 'All',
      image:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=60',
    },
    {
      id: '2',
      name: 'Classic Eggs',
      image:
        'https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.webp?a=1&b=1&s=612x612',
    },
    {
      id: '3',
      name: 'Speciality Eggs',
      image:
        'https://media.istockphoto.com/id/1265209311/photo/fried-chicken-kebab-or-kabab.webp?a=1&b=1&s=612x612',
    },
    {
      id: '4',
      name: 'Organic',
      image:
        'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const productImages = [
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=60',
    'https://media.istockphoto.com/id/1265209311/photo/fried-chicken-kebab-or-kabab.webp?a=1&b=1&s=612x612',
    'https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.webp?a=1&b=1&s=612x612',
  ];

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.name;
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => setSelectedCategory(item.name)}>
        <View
          style={[
            styles.categoryImageContainer,
            isSelected && styles.selectedCategoryImage,
          ]}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        </View>
        <Text
          style={[
            styles.categoryName,
            isSelected && styles.selectedCategoryName,
          ]}>
          {item.name}
        </Text>
        {isSelected && <View style={styles.categoryUnderline} />}
      </TouchableOpacity>
    );
  };

  // 🔹 Auto-slide banner logic
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % bannerImages.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setActiveBannerIndex(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBannerIndex]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Eggs</Text>
          <Icon name="keyboard-arrow-down" size={28} color="#333" />
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="search" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔹 Auto Sliding Info Banner */}
        <View style={styles.bannerWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollViewRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}>
            {bannerImages.map((banner, index) => (
              <View key={banner.id} style={[styles.infoBanner, { width }]}>
                <View style={styles.infoBannerTextContainer}>
                  <Text style={styles.infoBannerText}>{banner.text1}</Text>
                  <Text style={styles.infoBannerText}>{banner.text2}</Text>
                </View>
                <Image
                  source={{ uri: banner.image }}
                  style={styles.chickenImage}
                />
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {bannerImages.map((_, index) => {
              const opacity = scrollX.interpolate({
                inputRange: [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View key={index} style={[styles.dot, { opacity }]} />
              );
            })}
          </View>
        </View>

        {/* Categories Horizontal List */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Filters and Items Count */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.filtersButton}>
            <MaterialCommunityIcons
              name="tune-variant"
              size={22}
              color="#333"
            />
            <Text style={styles.filtersText}>Filters</Text>
          </TouchableOpacity>
          <Text style={styles.itemsCount}>6 items</Text>
        </View>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: productImages[activeImageIndex] }}
              style={styles.productImage}
            />
            <View style={styles.bookmarkButton}>
              <Icon name="bookmark-border" size={20} color="#8B4513" />
            </View>

            <View style={styles.imagePaginationDots}>
              {productImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageDot,
                    activeImageIndex === index && styles.imageActiveDot,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>Brown Eggs - Pack of 6</Text>
            <Text style={styles.productDescription}>
              Try eggs from a special breed of hens.
            </Text>

            <View style={styles.productDetails}>
              <Text style={styles.productDetailText}>6 units</Text>
              <Text style={styles.productDetailSeparator}>|</Text>
              <Text style={styles.productDetailText}>6 pieces</Text>
              <Text style={styles.productDetailSeparator}>|</Text>
              <Text style={styles.productDetailText}>serves 3-4</Text>
            </View>

            <View style={styles.deliveryTimeContainer}>
              <View style={styles.deliveryIconCircle}>
                <Icon name="bolt" size={18} color="#FF9800" />
              </View>
              <Text style={styles.deliveryTimeText}>Today in 90 mins</Text>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceLeftSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>₹87</Text>
                  <Text style={styles.originalPrice}>₹105</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>17% off</Text>
                  </View>
                </View>
                <Text style={styles.specialPriceText}>
                  Special Price for you
                </Text>
              </View>
              <View style={styles.addButtonSection}>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add</Text>
                  <Icon name="add" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.chooseMoreText}>Choose more</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFEFD5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFEFD5',
  },
  headerButton: { padding: 4 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#333' },

  // 🔹 Banner
  bannerWrapper: { position: 'relative' },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFE4B5',
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBannerTextContainer: { flex: 1 },
  infoBannerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
    lineHeight: 26,
  },
  chickenImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // 🔹 Categories & Products same as before...
  categoriesList: { paddingHorizontal: 16, marginBottom: 20 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCategoryImage: { borderWidth: 3, borderColor: '#8B4513' },
  categoryImage: { width: 70, height: 70, borderRadius: 35 },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    maxWidth: 90,
  },
  selectedCategoryName: { color: '#1a1a1a', fontWeight: '700' },
  categoryUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#C41E3A',
    marginTop: 4,
    borderRadius: 2,
  },

  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtersText: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  itemsCount: { fontSize: 18, fontWeight: '600', color: '#666' },

  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  productImageContainer: { width: '100%', height: 280, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  imagePaginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  imageActiveDot: { backgroundColor: '#fff' },
  productInfo: { padding: 16 },
  productTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  productDescription: { fontSize: 15, color: '#999', marginBottom: 12 },
  productDetails: { flexDirection: 'row', alignItems: 'center' },
  productDetailText: { fontSize: 14, color: '#666' },
  productDetailSeparator: { color: '#ddd', marginHorizontal: 8 },
  deliveryTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  deliveryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deliveryTimeText: { fontSize: 15, fontWeight: '600', color: '#333' },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  currentPrice: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  specialPriceText: { fontSize: 14, color: '#00A651', fontWeight: '700' },
  addButton: {
    backgroundColor: '#D81B60',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: { fontSize: 18, fontWeight: '700', color: '#fff', marginRight: 8 },
  chooseMoreText: { fontSize: 13, color: '#999' },
  bottomPadding: { height: 40 },
});

export default EggsCategoryScreen;