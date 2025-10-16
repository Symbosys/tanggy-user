import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const WelcomeRewards: React.FC = () => {
  return (
    <View style={styles.welcomeRewards}>
      <Text style={styles.rewardsTitle}>WELCOME REWARDS</Text>
      <View style={styles.rewardsContent}>
        <View>
          <Text style={styles.rewardsMainText}>
            Extra 20% off + Free delivery
          </Text>
          <Text style={styles.rewardsSubText}>on your first 5 orders!</Text>
          <Text style={styles.couponCode}>Code: 20FLAT</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeRewards: {
    backgroundColor: '#fce4ec',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  rewardsTitle: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsMainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardsSubText: {
    fontSize: 14,
    color: '#FF7622',
    marginTop: 2,
  },
  couponCode: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 4,
  },
  giftImage: {
    width: 80,
    height: 80,
  },
});

export default WelcomeRewards;