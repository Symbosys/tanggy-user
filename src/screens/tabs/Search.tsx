import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchScreen = () => {
  const suggestions = [
    'Fried Chicken',
    'Chicken Wings',
    'Chicken Sandwich',
    'Chicken Nuggets',
    'Chicken Salad',
  ];

  const results = [
    { name: 'Classic Fried Chicken', description: '10 pieces', price: '$12.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI60gfVikUPDaMSthXWTZIyyilt-SZueDGTKxk5_aEE8EGdyLJvc9IE9zT2T-_rMuNMn0rm-qDmlTaQSsDKf7b8P28nY0Q7g2VHRUYKW8FpVdvn9fb5k76nSI0ZNCc3RFDfNIa_95ycHmFb6bQexcnM0Ihr_SWgbo-fsoObFWwvx0GlUV0Wubpx9nqlVLFYnp0K5ns6y-jQQf93p0hML1rFG2H4SMTmY3wrSlZRkTviI3L8tfYutcO3CLjr1zUZcmwLnwmIu3vlSba' },
    { name: 'Spicy Chicken Wings', description: '6 pieces', price: '$8.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBPe7cLZ7Ae6B1BFB8mKSaR_6FiVnYo-nUN5jmgz-_QK4kw9dXYWUyhNPSwnR5QPsEDGOmkTpy6n0W7r1pEZ3OV59gyg-LWSF-AC1wRnT3VqR1ZwrkMZSxTCa5przMy030vwbvmrj_FyV_0v88Hav4wN3pDvAN4F_UCnZgBxfsSxeB7akmkrP6NCx2BAW-sMFs0GVodryo0lZ73kl9-up4L7EHy18DCzyH3zQHabGA2jr_jdiPjq3HX19ZifbAJ5v1YU9TQSEMmCVu' },
    { name: 'Grilled Chicken Sandwich', description: '1 sandwich', price: '$7.49', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB33m4CnQ6QEQHS7I82oN42on3Fqp7CViZbDHUP7htzDq2zgfJ7GYNej1uVaFIoP3Z78YGM-gxED0W8aTrIzlXcW8BOm7xmnSAroa3fDWzLA1w22HuXyLEsb1tVcAD8ch8d9NZoVhlVYcWaPgMZR2F5ZEB4HS34aB2U_v25SjbS9gtub_jWOopuxcrNc6GTytV7b0ehFIPSKnYMJGURQKQ7o0ps-nTdQ18krNoEitLbGMsJNC6pvFB2QW33HcBlQliVvG-vHNgbUAwN' },
    { name: 'Crispy Chicken Nuggets', description: '8 pieces', price: '$5.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR-4ErEYTgpkWT9YHtO6Ez4iKuPyzGmu8VIN2tZWeyaYIK77HvfUq5OCLKDmRZU0e6mUZFmhHJm8owxGPtpId4yfn-cuGDWUZOWFOZLfPYmJIu0xLsr4-JR43hkez1h8SUm_9lPrjvV0bEzlX7Tfxes5gNQ6lM66DcdCNaxGKoRZ29oiTR5aqT2zdxXn6fYzVM97D182ramqiSFvtIlAqJhMBPwSR9OkD-fHiTb95BDwr6AYFQL_hWpLuEVC846RoFVVMQcOjX0mu4' },
    { name: 'Chicken Caesar Salad', description: 'Large', price: '$9.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCMkbqnPqgxuUSyiZ_MW8StLlOYEWWGwUMX50QvBBgiKJIPKlrbnGoW7rGuLsElHm5pmwhgzskABYBuqLv0km7de01N4RiNdlhe8MkQb4vf5QbuYHKGoCEBiNYNlvEZ73p3JuUPQvkhWakRezDBwSdNNzMYUsiwhtvjOQe69qpjnNATtiFqqoPRzrZ603bP0O-31CY9vV2Ax-AEeDxGiBX3FbYb6F6gab2dksQzLs9ipCJJmaqbOlJjgU15r1CtcT9y_li0JdDs4Eq' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={24} color="#8d6d58" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value="Chicken"
                placeholder="Search"
                placeholderTextColor="#8d6d58"
              />
              <TouchableOpacity style={styles.clearButton}>
                <Icon name="cancel" size={24} color="#8d6d58" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Suggestions */}
          <Text style={styles.sectionTitle}>Suggestions</Text>
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Results */}
          <Text style={styles.sectionTitle}>Results</Text>
          {results.map((item, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultContent}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{item.name}</Text>
                  <Text style={styles.resultDescription}>{item.description}</Text>
                </View>
              </View>
              <Text style={styles.resultPrice}>{item.price}</Text>
            </View>
          ))}
          {/* Results */}
          <Text style={styles.sectionTitle}>Results</Text>
          {results.map((item, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultContent}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{item.name}</Text>
                  <Text style={styles.resultDescription}>{item.description}</Text>
                </View>
              </View>
              <Text style={styles.resultPrice}>{item.price}</Text>
            </View>
          ))}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf9',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1ece9',
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    color: '#191310',
    fontSize: 16,
    paddingHorizontal: 8,
    backgroundColor: '#f1ece9',
  },
  clearButton: {
    paddingRight: 16,
  },
  sectionTitle: {
    color: '#191310',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  suggestionItem: {
    height: 32,
    backgroundColor: '#f1ece9',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    margin: 4,
  },
  suggestionText: {
    color: '#191310',
    fontSize: 14,
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbfaf9',
    padding: 16,
    minHeight: 72,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '80%',
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f1ece9',
  },
  resultTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  resultTitle: {
    color: '#191310',
    fontSize: 16,
    fontWeight: '500',
  },
  resultDescription: {
    color: '#8d6d58',
    fontSize: 14,
  },
  resultPrice: {
    color: '#191310',
    fontSize: 16,
    maxWidth: '20%',
    textAlign: 'right',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1ece9',
    backgroundColor: '#fbfaf9',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navText: {
    color: '#8d6d58',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  navTextActive: {
    color: '#191310',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default SearchScreen;