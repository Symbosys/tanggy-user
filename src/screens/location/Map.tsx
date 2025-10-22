import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import MapView, {Region} from 'react-native-maps';
import {
  checkLocationPermission,
  getAddressFromCoords,
  getCurrentLocation,
  requestLocationPermission,
  turnOnLocation,
} from '../../utils/permissions/location';
import api from '../../api/api';
import {AxiosError} from 'axios';

const {height, width} = Dimensions.get('window');
function AddAddress() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Home');
  const [completeAddress, setCompleteAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapHeight, setMapHeight] = useState(0);

  const [formSubmitting, setFormSubmitting] = useState(false);

  const mapRef = useRef<MapView>(null);

  const handleSearchPress = () => {
    setShowSearchModal(true);
  };
  const handleAddDetailsPress = () => {
    setShowBottomSheet(true);
  };
  const handleChangePress = () => {
    setShowBottomSheet(true);
  };
  const closeBottomSheet = () => {
    setShowBottomSheet(false);
  };
  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  const handleLocationPermission = async () => {
    const granted = await requestLocationPermission();
    setHasLocationPermission(granted);
    if (granted) {
      const location = await getCurrentLocation();
      if (location) {
        setSelectedCoords(location);
        const address = await getAddressFromCoords(
          location.latitude,
          location.longitude,
        );
        setCurrentAddress(address);
        mapRef.current?.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: initialRegion.latitudeDelta,
            longitudeDelta: initialRegion.longitudeDelta,
          },
          1000,
        );
      } else {
        ToastAndroid.show('Could not fetch location', ToastAndroid.LONG);
      }
    }
  };

  const handleTurnOnLocation = async () => {
    try {
      setLoadingLocation(true);
      if (hasLocationPermission) {
        await turnOnLocation();
        const location = await getCurrentLocation();
        if (location) {
          setSelectedCoords(location);
          const address = await getAddressFromCoords(
            location.latitude,
            location.longitude,
          );
          setCurrentAddress(address);
          mapRef.current?.animateToRegion(
            {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: initialRegion.latitudeDelta,
              longitudeDelta: initialRegion.longitudeDelta,
            },
            1000,
          );
        } else {
          ToastAndroid.show('Could not fetch location', ToastAndroid.LONG);
        }
      } else {
        await handleLocationPermission();
      }
    } catch (error) {
    } finally {
      setLoadingLocation(false);
    }
  };

  // ✅ Check permission and enable location on mount
  useEffect(() => {
    const initLocationSetup = async () => {
      setLoadingLocation(true);
      try {
        const granted = await checkLocationPermission();
        setHasLocationPermission(granted ?? false);
        if (granted) {
          // turn on GPS if not enabled
          await turnOnLocation();
          // then get coordinates
          const location = await getCurrentLocation();
          if (location) {
            setSelectedCoords(location);
            const address = await getAddressFromCoords(
              location.latitude,
              location.longitude,
            );
            setCurrentAddress(address);
            mapRef.current?.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: initialRegion.latitudeDelta,
                longitudeDelta: initialRegion.longitudeDelta,
              },
              1000,
            );
          } else {
            ToastAndroid.show('Could not fetch location', ToastAndroid.LONG);
          }
        } else {
          const newGranted = await requestLocationPermission();
          setHasLocationPermission(newGranted);
          if (newGranted) {
            const location = await getCurrentLocation();
            if (location) {
              setSelectedCoords(location);
              const address = await getAddressFromCoords(
                location.latitude,
                location.longitude,
              );
              setCurrentAddress(address);
              mapRef.current?.animateToRegion(
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: initialRegion.latitudeDelta,
                  longitudeDelta: initialRegion.longitudeDelta,
                },
                1000,
              );
            } else {
              ToastAndroid.show('Could not fetch location', ToastAndroid.LONG);
            }
          }
        }
      } catch (error) {
      } finally {
        setLoadingLocation(false);
      }
    };
    initLocationSetup();
  }, []); // ✅ run once on mount

  useEffect(() => {
    const updateAddress = async () => {
      if (selectedCoords) {
        const address = await getAddressFromCoords(
          selectedCoords.latitude,
          selectedCoords.longitude,
        );
        setCurrentAddress(address);
      }
    };
    updateAddress();
  }, [selectedCoords]);

  const tags = ['Home', 'Work', 'Other'];
  const onRegionChangeComplete = (region: Region) => {
    setSelectedCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  // ✅ Check if all required fields are filled
  const isFormValid =
    receiverName.trim().length > 0 &&
    receiverContact.trim().length >= 10 && // at least 10 digits
    completeAddress.trim().length > 0 &&
    currentAddress.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {hasLocationPermission ? null : (
        <View
          style={{
            backgroundColor: '#ffcccc',
            padding: 10,
            alignItems: 'center',
          }}>
          <Text style={{color: '#cc0000', fontWeight: '500'}}>
            Location permission is required to use this feature.
          </Text>
        </View>
      )}
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm delivery location</Text>
        </View>
      </SafeAreaView>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search for area, street name...
          </Text>
        </TouchableOpacity>
      </View>
      {/* Map Container with Fixed Marker */}
      <View
        style={{flex: 1, position: 'relative'}}
        onLayout={event => setMapHeight(event.nativeEvent.layout.height)}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={true}
        />
        <View style={[styles.markerFixed, {top: mapHeight / 2 - 70}]}>
          <Image
            source={require('../../assets/map/marker.png')}
            style={{height: 100, width: 40}}
          />
        </View>
      </View>
      {/* Use Current Location Button */}
      <View style={styles.currentLocationContainer}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleTurnOnLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.currentLocationText}>Use current location</Text>
        </TouchableOpacity>
      </View>
      {/* Delivery Address Info */}
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryLabel}>DELIVERING YOUR ORDER TO</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.locationPin}>📍</Text>
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressTitle}>
              {currentAddress.split(',')[0] || 'Unknown'}
            </Text>
            <Text style={styles.addressSubtitle}>
              {currentAddress.split(',').slice(1).join(', ') || ''}
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeText} onPress={handleChangePress}>
              CHANGE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Add More Details Button */}
      <TouchableOpacity
        style={styles.addDetailsButton}
        onPress={handleAddDetailsPress}>
        <Text style={styles.addDetailsText}>Add more address details</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBottomSheet}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={closeBottomSheet}
          />
          <View style={styles.bottomSheet}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeBottomSheet}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <ScrollView
              style={styles.bottomSheetContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.bottomSheetTitle}>
                Enter complete address
              </Text>
              {/* Receiver Details */}
              <View style={styles.receiverSection}>
                <Text style={styles.sectionLabel}>
                  Receiver details for this address
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Receiver Name *"
                  value={receiverName}
                  onChangeText={setReceiverName}
                  placeholderTextColor={'#999'}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Receiver Contact *"
                  value={receiverContact}
                  onChangeText={setReceiverContact}
                  maxLength={10}
                  placeholderTextColor={'#999'}
                  keyboardType="phone-pad"
                />
              </View>
              {/* Tag Selection */}
              <View style={styles.tagSection}>
                <Text style={styles.sectionLabel}>
                  Tag this location for later
                </Text>
                <ScrollView
                  style={styles.tagContainer}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagButton,
                        selectedTag === tag && styles.tagButtonSelected,
                        index === tags.length - 1 && {marginRight: 0},
                      ]}
                      onPress={() => setSelectedTag(tag)}>
                      <Text
                        style={[
                          styles.tagText,
                          selectedTag === tag && styles.tagTextSelected,
                        ]}>
                        {tag === 'Home' ? '🏠' : tag === 'Work' ? '🏢' : '📍'}{' '}
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Current Location Display */}
              <View style={styles.currentAddressSection}>
                <View style={styles.currentAddressContainer}>
                  <Text style={styles.currentAddress}>{currentAddress}</Text>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={handleChangePress}>
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.mapPinNote}>
                  Updated based on your exact map pin
                </Text>
              </View>
              {/* Form Fields */}
              <View style={styles.formSection}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Complete Address *"
                  value={completeAddress}
                  onChangeText={setCompleteAddress}
                  placeholderTextColor={'#999'}
                  multiline
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Floor (Optional)"
                  value={floor}
                  onChangeText={setFloor}
                  placeholderTextColor={'#999'}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Landmark (Optional)"
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholderTextColor={'#999'}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    {backgroundColor: '#f5f5f5', color: '#d3ccccff'},
                  ]}
                  placeholder="City *"
                  value="Ranchi"
                  editable={false}
                  placeholderTextColor={'#999'}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Instructions (Optional)"
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholderTextColor={'#999'}
                  multiline
                />
              </View>
              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isFormValid && styles.confirmButtonDisabled,
                  formSubmitting && styles.confirmButtonSubmitting,
                ]}
                disabled={!isFormValid}
                onPress={async () => {
                  if (!isFormValid) return;
                  try {
                    setFormSubmitting(true);
                    const res = await api.post('/user/address/create', {
                      type: selectedTag.toUpperCase(),
                      mainAddress: currentAddress || 'Unknown',
                      completeAddress,
                      receiverName,
                      receiverContact,
                      landMark: landmark,
                      floor,
                      city: 'Ranchi',
                      instructions,
                      latitude: selectedCoords?.latitude,
                      longitude: selectedCoords?.longitude,
                    });
                    if (res.data.success) {
                      ToastAndroid.show(
                        `${res.data.message || 'Address added successfully'}`,
                        ToastAndroid.LONG,
                      );
                    }
                  } catch (error) {
                    if (error instanceof AxiosError) {
                      ToastAndroid.show(
                        error.response?.data?.message ||
                          'Failed to add address',
                        ToastAndroid.LONG,
                      );
                    } else {
                      ToastAndroid.show(
                        'Failed to add address',
                        ToastAndroid.LONG,
                      );
                    }
                  } finally {
                    setFormSubmitting(false);
                  }
                  closeBottomSheet();
                }}>
                <Text
                  style={[
                    styles.confirmButtonText,
                    !isFormValid && styles.confirmButtonTextDisabled,
                    formSubmitting && styles.confirmButtonTextSubmitting,
                  ]}>
                 {formSubmitting ? 'Submitting...' : 'Confirm Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Google Places Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeSearchModal}>
        <View style={styles.searchModalOverlay}>
          <SafeAreaView style={styles.searchModalContainer}>
            {/* Header */}
            <View style={styles.searchModalHeader}>
              <TouchableOpacity
                style={styles.searchModalBackButton}
                onPress={closeSearchModal}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.searchModalTitle}>My Addresses</Text>
            </View>
            {/* Search Input */}
            <View style={styles.searchModalInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchModalInput}
                placeholder="Search for area, street name..."
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            {/* Location Not Enabled Notice */}
            <View style={styles.locationNoticeContainer}>
              <View style={styles.locationNotice}>
                <Text style={styles.locationIcon}>📍</Text>
                <View style={styles.locationNoticeTextContainer}>
                  <Text style={styles.locationNoticeTitle}>
                    Device location not enabled
                  </Text>
                  <Text style={styles.locationNoticeSubtitle}>
                    Tap here to enable your device location for a better
                    experience
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.enableButton}
                  onPress={handleTurnOnLocation}>
                  <Text style={styles.enableButtonText}>Enable</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.searchModalContent}
              showsVerticalScrollIndicator={false}>
              {/* Nearby Locations */}
              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>NEARBY LOCATIONS</Text>
                <TouchableOpacity style={styles.locationItem}>
                  <Text style={styles.locationPin}>📍</Text>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationName}>
                      Itsy Hotels Cradle Regency
                    </Text>
                    <Text style={styles.locationAddress}>
                      Beside New AG Colony Road, Basant Vihar, Kadru, Ashok
                      Nagar, Ranchi, J...
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Recent Locations */}
              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>RECENT LOCATIONS</Text>
                <TouchableOpacity style={styles.locationItem}>
                  <View style={styles.recentLocationIcon}>
                    <Text style={styles.clockIcon}>🕐</Text>
                    <Text style={styles.distanceText}>0 m</Text>
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationName}>Work</Text>
                    <Text style={styles.locationAddress}>
                      Harmu Housing Colony, Delatoli, Ranchi
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Google Attribution */}
              <View style={styles.googleAttribution}>
                <Text style={styles.poweredByText}>powered by </Text>
                <Text style={styles.googleText}>Google</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
      {loadingLocation && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e74c3c" />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: 'absolute',
    left: width / 2 - 20,
  },
  currentLocationContainer: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    marginRight: 8,
  },
  currentLocationText: {
    color: '#e74c3c',
    fontWeight: '800',
  },
  deliveryInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 16,
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
    width: '70%',
    marginRight: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  changeText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  addDetailsButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addDetailsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    paddingTop: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    marginTop: 8,
  },
  receiverSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  receiverDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  receiverText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    fontSize: 18,
    color: '#ccc',
  },
  tagSection: {
    marginBottom: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 12, // ✅ add spacing between tags
  },
  tagButtonSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: '#e74c3c',
  },
  currentAddressSection: {
    marginBottom: 24,
  },
  currentAddressContainer: {
    backgroundColor: '#bdbabaff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentAddress: {
    fontSize: 16,
    color: '#6f6a6aff',
    flex: 1,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  mapPinNote: {
    fontSize: 12,
    color: '#666',
  },
  formSection: {
    marginBottom: 32,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 50,
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  confirmButtonSubmitting: {
    backgroundColor: '#f0a1a1',
    paddingVertical: 16,
  },
  confirmButtonDisabled: {
    backgroundColor: '#f0a1a1',
  },

  confirmButtonTextDisabled: {
    color: '#fff',
    opacity: 0.6,
  },
  confirmButtonTextSubmitting: {
    opacity: 0.8,
  },

  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchModalContainer: {
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  searchModalBackButton: {
    marginRight: 16,
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  searchModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchModalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginLeft: 8,
  },
  locationNoticeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  locationNoticeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 4,
  },
  locationNoticeSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  enableButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enableButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  searchModalContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  locationSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    paddingHorizontal: 16,
    marginBottom: 16,
    letterSpacing: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recentLocationIcon: {
    alignItems: 'center',
    minWidth: 40,
  },
  clockIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 10,
    color: '#666',
  },
  googleAttribution: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  poweredByText: {
    fontSize: 12,
    color: '#666',
  },
  googleText: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
export default AddAddress;

const initialRegion: Region = {
  latitude: 23.374006327619544,
  longitude: 85.28834426881085,
  latitudeDelta: 0.0001,
  longitudeDelta: 0.0020,
};