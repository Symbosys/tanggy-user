import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

interface RateReviewCardProps {
  rating: number;
  setRating: (rating: number) => void;
}

export const RateReviewCard: React.FC<RateReviewCardProps> = ({
  rating,
  setRating,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.cardTitle}>Rate and review</Text>

        <View style={styles.contentRow}>
          {/* User Avatar */}
          <Image
            source={{
              uri: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
            }}
            style={styles.avatar}
          />

          {/* Stars */}
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={32}
                  color={rating >= star ? COLORS.secondary : '#666'}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  container: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  starContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  starIcon: {
    marginHorizontal: 8,
  },
});
