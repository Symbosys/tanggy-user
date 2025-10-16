import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const WelcomeBanner: React.FC = () => {
  return (
    <View style={styles.welcomeBanner}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>
          Cheers to 10 years! Enjoy juicy deals on us.
        </Text>
        <View style={styles.offerSection}>
          <Image
            source={require('../../assets/profile/chicken_1.jpg')}
            style={styles.chickenImage}
          />
          <View style={styles.offerDetails}>
            <Text style={styles.offerTitle}>Chicken Curry Cut & more</Text>
            <Text style={styles.startingText}>Starting at</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.strikePrice}>₹193</Text>
              <Text style={styles.currentPrice}>₹160</Text>
            </View>
            <TouchableOpacity style={styles.orderButton}>
              <Text style={styles.orderButtonText}>ORDER NOW</Text>
              <MaterialIcons name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.gameButtons}>
        <TouchableOpacity style={styles.gameButton}>
          <MaterialCommunityIcons name="egg" size={24} color="#ffd700" />
          <Text style={styles.gameButtonText}>Golden Egg</Text>
          <MaterialIcons name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.gameButton, styles.playWinButton]}>
          <Text style={styles.playWinTitle}>PLAY &</Text>
          <Text style={styles.playWinTitle}>WIN</Text>
          <Text style={styles.luckyDrawText}>Lucky Draw</Text>
          <MaterialIcons name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.gameButton}>
          <Image
            source={require('../../assets/profile/chicken_1.jpg')}
            style={styles.partyPackImage}
          />
          <Text style={styles.gameButtonText}>Party Packs</Text>
          <MaterialIcons name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeBanner: {
    backgroundColor: '#FF7622',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  offerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chickenImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  offerDetails: {
    flex: 1,
    marginLeft: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  startingText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strikePrice: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderButton: {
    backgroundColor: '#c2185b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
  gameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameButton: {
    backgroundColor: '#c2185b',
    width: (width - 80) / 3,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playWinButton: {
    backgroundColor: '#ff9800',
  },
  gameButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  playWinTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  luckyDrawText: {
    color: '#fff',
    fontSize: 10,
    marginBottom: 4,
  },
  partyPackImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default WelcomeBanner;