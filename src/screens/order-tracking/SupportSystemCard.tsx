import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from './constants';

interface SupportSystemCardProps {
  navigation: any;
}

export const SupportSystemCard: React.FC<SupportSystemCardProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('AiAssistant')}
      >
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>support system</Text>
          <Text style={styles.cardSubtitle}>
            Chat with us about any issue related to your order
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#ccc" />
      </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
});
