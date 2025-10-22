import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../../store/location';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';

const HeaderAddress = ({navigation}: AppNavigation) => {
  const { primaryLocation, secondaryLocation } = useLocationStore();

  const handlePress = () => {
    navigation.navigate('select_your_location');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.container}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
          <View style={styles.locationWrapper}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.primaryLocationText}>
              {primaryLocation || 'Select Location'}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={COLORS.textPrimary}
            />
          </View>
        </View>

        <View style={styles.rightSection}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={13}
            color={COLORS.primary}
          />
          <Text style={styles.deliveryText}>Delivery</Text>
        </View>
      </View>

      {/* Secondary Row */}
      <View style={styles.bottomRow}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.secondaryLocationText}>
          {secondaryLocation || 'Please set your delivery area'}
        </Text>
        <Text style={styles.deliveryTime}>in 30 mins</Text>
      </View>
    </TouchableOpacity>
  );
};

export default HeaderAddress;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: 4,
  },
  primaryLocationText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: 140,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  secondaryLocationText: {
    flex: 1,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginRight: 10,
    maxWidth: '70%',
  },
  deliveryTime: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
