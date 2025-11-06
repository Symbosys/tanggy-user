import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 32 - 16) / 2; // Adjust for gap-4 (16px total gap)
const cardMinHeight = 260;

const categories = [
  {
    title: 'Chicken',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs0FjEl_cdtPY2XQyvgztnIxvTyHUfSVTejMBB2hn_7HuPEl8SIxEL0WA1y7uyIUMXVnEa2t_oRrKM38G_l0cwx6hlSXDNOn77XdYqhSYDxPfvHUDSE5yfsKrI86FQ5ZH0TPb87uM0VpShx1j05gvngsuAIRUe_9usLSxCK0n-YUsSS1uNvbMkeePfdGl9EwlTsddOmarpbyqr9Hgq8AFkjJhcvRQLxLGp6JFAcpjowt3nrwGPmbz5Gn5CK528weEybT8OPcJA_7Dh',
  },
  {
    title: 'Mutton',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaKXyN969icDvEDZivUyKCOenlqk43vialzHC4YoUKzmpRcjiq8Uwp0atxwnncaeUyJye76FyiFNVUUKsg-qQS8ti8Gm1VL8wHIVDazr83rogP3rEuc0FRu8xzmGJoNoDoZnH2heKP8SvGdWNX8BPqG0ZZ9Nueq6ca6qb00qdgJZwbAE4b8DERgFeg72HJZbJhzWB0Up_S7o7IaBpGLJqWZ-euriYe1p19TNGhZy7mReZr-AKzsb2EAzWMuQiw1HCs6mLg1kotqfJ9',
  },
  {
    title: 'Fish & Seafood',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnDP-zBWI7e8MO6u-MromDLyuHvAQH3-KlRsmdj_wRg1br1KMPQWtgxb4fOpThzK9m6UXPsho5cpSjAsDr6bXZUETqslOumO68IfcGrcIx2nk_AmATDt2EQ00Mvf-Sr9uMXYQ-Ymx2piuhNZhAsNicxFcDuq5sMIUQh8BR0O6IPxutt2bkeweHvvcT29IZ73w3bWL1yDIEfmDiFXighMw31jlABIMfFKfmNkp5QQPYNj29YuLM4dU2rbcp9zlQxeefm3UeI6lVpBIH',
  },
  {
    title: 'Ready to Cook',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDul4E-FMMf9SAR8OLihJ1APjWSUr1D0_Bao4pbBGEON5bOka3JBmYRGCbfQkEeyDRTFOGVqr4OWXT9Dv5_5RSjEKhQGG96rV59Y1dq9p86UkygXZgy_ub4aBUQQDlPFwvwzLWTzahysbpnJKiDbP5sID1qt_wyvvqbRRQ1WPMiZ2qnoNRlTEhBG_faqXgnDcA6z-G6yl4OcrFW7xA74kAVGPB2Brrx2P4JGSiWtJANpBGLe7APn8lpDNqLt3hzWGDkuBDl72dcYule',
  },
  {
    title: 'Prawns',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCalMazopwnOXPrpV-fBNJy5ej7QHCXZA0SnSOea9QvQtJDz7gHk4EpX7IBIq0FOA9wrgZoAkSu_TRyPXvF8zXeSna6tdyeM2PYYH4W7_NqreGDdZzzIVX2CV_CmuqIFOva7NWhwuMzm25IG20gCy1NI2Oamv1BOWVYKhxmg7Iyxc0njR3JTn5wkMJ8OBjNLbhlxlFiZV8GY3jEiC0OnUWwvE9Zv48S-Ba64kovc82NyyLwi0Y8XWRE7vGHAYwh-ToU8xKGv0rT2hKQ',
  },
  {
    title: 'Eggs',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWwEYQP4FtQri_VlaEycA_wd9ADhFLv_fQAwstM02WtWzPauBvOonRrH3HX3ls_cW1zuKjpyegh-16lu63gvFSscbRxGkqIrE2qFGPCuMKVT9AWu12OxzIjfGnJZ018hirAdrpAL82l_vsT1smmA_aimqbLzy2u-rYGMYrapYThe7k0NNMHOqxqi6aLm_dX6V3suVO17md5IYWMgJpDj8PookFYxXcZRegwdywHJXpAi6OteL_Ql1yEfFFPI_PxvaCBSgv087UMvdr',
  },
];

const ExploreCategories = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Categories</Text>
        <Text style={styles.subtitle}>Discover fresh meat and seafood selections</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <View
              key={index}
              style={[
                styles.cardWrapper,
                { width: itemWidth, minHeight: cardMinHeight, marginBottom: 16 },
              ]}>
              <LinearGradient
                colors={['#f9eae9', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: cat.image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  <LinearGradient
                    colors={['#8719C6', '#b58ff0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}>
                    <TouchableOpacity style={styles.buttonTouchable}>
                      <Text style={styles.buttonText}>View Products</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6f8',
  },
  header: {
    flexDirection: 'column',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#f7f6f8',
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '700',
    color: '#1b1121',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    paddingBottom: 12,
    paddingTop: 4,
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 24,
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
    padding: 16,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    // Width and minHeight set inline
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 128,
    borderRadius: 100,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonGradient: {
    width: '100%',
    height: 40,
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 12,
  },
  buttonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default ExploreCategories;