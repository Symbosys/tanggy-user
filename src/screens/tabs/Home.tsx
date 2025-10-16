import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderAddress from '../../components/home/Header';
import WelcomeBanner from '../../components/home/WelcomeBanner';
import WelcomeRewards from '../../components/home/WelcomeRewards';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HeaderAddress />
      <ScrollView style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <WelcomeBanner />
        <WelcomeRewards />


        {/* BestSeller Section  */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bestsellers</Text>
          <Text style={styles.sectionSubtitle}>
            Most popular products near you!
          </Text>
        </View>

        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },

  // BestSeller Section Styles
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
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});
