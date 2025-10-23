import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BottomNav: React.FC = () => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="home" size={24} color="#FF7622" />
        <Text style={[styles.navText, {color: '#FF7622'}]}>Minta</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="category" size={24} color="#666" />
        <Text style={styles.navText}>Categories</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, styles.centerNavItem]}>
        <View style={styles.centerNavBadge}>
          <Text style={styles.centerNavText}>Ready-to-cook</Text>
          <Text style={styles.centerNavSubText}>Snacks & Starters</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="search" size={24} color="#666" />
        <Text style={styles.navText}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name="person" size={24} color="#666" />
        <Text style={styles.navText}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  centerNavItem: {
    backgroundColor: '#ffca28',
    borderRadius: 20,
    padding: 8,
  },
  centerNavBadge: {
    alignItems: 'center',
  },
  centerNavText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  centerNavSubText: {
    fontSize: 10,
    color: '#666',
  },
});

export default BottomNav;
