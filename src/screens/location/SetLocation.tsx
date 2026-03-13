import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator as RNActivityIndicator,
    Keyboard,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import {
    checkLocationPermission,
    getCurrentLocation,
    requestLocationPermission,
    turnOnLocation,
} from '../../utils/permissions/location';
import { useLocationStore } from '../../store/location'
import { AppNavigation } from '../../types/type';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';

const { height, width } = Dimensions.get('window');
const OLA_API_KEY = 'AbLgb9uuCk5EsknyN9nd1hol4dk85ehUH7izgU1e';

interface Prediction {
    description: string;
    place_id: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
}

interface PlaceDetails {
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

function SetLocation({ navigation }: AppNavigation) {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
    const [selectedCoords, setSelectedCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [currentAddress, setCurrentAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [mapHeight, setMapHeight] = useState(0);
    const [deliveryInfoHeight, setDeliveryInfoHeight] = useState(120);

    // Autocomplete states
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const { setLocation, setPrimaryLocation, setSecondaryLocation } = useLocationStore();

    const mapRef = useRef<MapView>(null);

    const handleSearchPress = () => {
        setShowSearchModal(true);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchText('');
        setPredictions([]);
        setShowResults(false);
    };

    // Get address from Ola Maps Reverse Geocoding
    const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${OLA_API_KEY}`
            );
            const data = await response.json();

            if (data && data.status === 'ok' && data.results && data.results.length > 0) {
                return data.results[0].formatted_address || 'Unknown location';
            }
            return 'Unknown location';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return 'Unknown location';
        }
    };

    const handleLocationPermission = async () => {
        const granted = await requestLocationPermission();
        setHasLocationPermission(granted);
        if (granted) {
            const location = await getCurrentLocation();
            if (location) {
                setSelectedCoords(location);
                const address = await getAddressFromCoords(location.latitude, location.longitude);
                setCurrentAddress(address);
                mapRef.current?.animateToRegion(
                    {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.0001,
                        longitudeDelta: 0.0020,
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
                    const address = await getAddressFromCoords(location.latitude, location.longitude);
                    setCurrentAddress(address);
                    mapRef.current?.animateToRegion(
                        {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.0001,
                            longitudeDelta: 0.0020,
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
            console.error('Location error:', error);
        } finally {
            setLoadingLocation(false);
        }
    };

    // Initialize location on mount
    useEffect(() => {
        const initLocationSetup = async () => {
            setLoadingLocation(true);
            try {
                const granted = await checkLocationPermission();
                setHasLocationPermission(granted ?? false);
                if (granted) {
                    await turnOnLocation();
                    const location = await getCurrentLocation();
                    if (location) {
                        setSelectedCoords(location);
                        const address = await getAddressFromCoords(location.latitude, location.longitude);
                        setCurrentAddress(address);
                        mapRef.current?.animateToRegion(
                            {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0001,
                                longitudeDelta: 0.0020,
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
                            const address = await getAddressFromCoords(location.latitude, location.longitude);
                            setCurrentAddress(address);
                            mapRef.current?.animateToRegion(
                                {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.0001,
                                    longitudeDelta: 0.0020,
                                },
                                1000,
                            );
                        } else {
                            ToastAndroid.show('Could not fetch location', ToastAndroid.LONG);
                        }
                    }
                }
            } catch (error) {
                console.error('Init location error:', error);
            } finally {
                setLoadingLocation(false);
            }
        };
        initLocationSetup();
    }, []);

    // Update address when coords change
    useEffect(() => {
        const updateAddress = async () => {
            if (selectedCoords) {
                const address = await getAddressFromCoords(selectedCoords.latitude, selectedCoords.longitude);
                setCurrentAddress(address);
            }
        };
        updateAddress();
    }, [selectedCoords]);

    // Debounced search for autocomplete
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length > 2) {
                searchPlaces(searchText);
            } else {
                setPredictions([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    const searchPlaces = async (text: string) => {
        setLoadingSearch(true);
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
                    text,
                )}&api_key=${OLA_API_KEY}&language=en`,
            );
            const apiResponse = await response.json();

            const apiData = apiResponse.data || apiResponse;
            if (apiData && apiData.status === 'ok') {
                setPredictions(apiData.predictions);
                setShowResults(true);
            } else {
                console.error('Error:', apiData?.status || 'Unknown error');
                setPredictions([]);
                setShowResults(false);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setPredictions([]);
            setShowResults(false);
        } finally {
            setLoadingSearch(false);
        }
    };

    const getPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${OLA_API_KEY}`,
            );
            const apiResponse = await response.json();

            const apiData = apiResponse.data || apiResponse;
            if (apiData && apiData.status === 'ok') {
                const details: PlaceDetails = apiData.result;
                return details;
            } else {
                console.error('Details API error:', apiData?.status || 'Unknown error');
            }
        } catch (error) {
            console.error('Details fetch error:', error);
        }
        return null;
    };

    const handleSelectPlace = async (prediction: Prediction) => {
        setSearchText(prediction.structured_formatting.main_text);
        setShowResults(false);
        setPredictions([]);
        Keyboard.dismiss();

        setLoadingLocation(true);
        const details = await getPlaceDetails(prediction.place_id);

        if (details) {
            const newCoords = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
            };
            setSelectedCoords(newCoords);
            setCurrentAddress(details.formatted_address);

            mapRef.current?.animateToRegion(
                {
                    latitude: newCoords.latitude,
                    longitude: newCoords.longitude,
                    latitudeDelta: 0.0001,
                    longitudeDelta: 0.0020,
                },
                1000,
            );
        }
        setLoadingLocation(false);
        closeSearchModal();
    };

    const handleConfirmLocation = () => {
        if (selectedCoords && currentAddress) {
            setLocation(selectedCoords.latitude, selectedCoords.longitude);
            setPrimaryLocation(currentAddress.split(',')[0] || 'Unknown');
            setSecondaryLocation(currentAddress.split(',').slice(1).join(', ') || '')
            ToastAndroid.show('Location confirmed', ToastAndroid.SHORT);
            navigation.navigate('BottomTab');
        } else {
            ToastAndroid.show('Please select a location first', ToastAndroid.SHORT);
        }
    };

    const onRegionChangeComplete = (region: Region) => {
        setSelectedCoords({
            latitude: region.latitude,
            longitude: region.longitude,
        });
    };

    const renderPrediction = ({ item }: { item: Prediction }) => (
        <TouchableOpacity
            style={styles.predictionItem}
            onPress={() => handleSelectPlace(item)}>
            <Text style={styles.mainText}>{item.structured_formatting.main_text}</Text>
            <Text style={styles.secondaryText}>
                {item.structured_formatting.secondary_text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {hasLocationPermission ? null : (
                <View style={styles.permissionBanner}>
                    <Text style={styles.permissionText}>
                        Location permission is required to use this feature.
                    </Text>
                </View>
            )}

            {/* Header */}
            {/* <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Set your location</Text>
                </View>
            </SafeAreaView> */}

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
                style={{ flex: 1, position: 'relative' }}
                onLayout={event => setMapHeight(event.nativeEvent.layout.height)}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: 23.374006327619544,
                        longitude: 85.28834426881085,
                        latitudeDelta: 0.0001,
                        longitudeDelta: 0.0020,
                    }}
                    onRegionChangeComplete={onRegionChangeComplete}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                />
                <View style={[styles.markerFixed, { top: mapHeight / 2 - 70 }]}>
                    <Image
                        source={require('../../assets/map/marker.png')}
                        style={{ height: 100, width: 40 }}
                    />
                </View>
            </View>

            {/* Use Current Location Button */}
            <View style={[styles.currentLocationContainer, { bottom: deliveryInfoHeight + 20 }]}>
                <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleTurnOnLocation}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.currentLocationText}>Use current location</Text>
                </TouchableOpacity>
            </View>

            {/* Selected Location Info */}
            <View
                style={styles.deliveryInfo}
                onLayout={(event) => setDeliveryInfoHeight(event.nativeEvent.layout.height)}
            >
                <Text style={styles.deliveryLabel}>SELECTED LOCATION</Text>
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
                </View>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
                    <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>

            {/* Search Modal */}
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
                            <Text style={styles.searchModalTitle}>Search Location</Text>
                        </View>

                        {/* Search Input */}
                        <View style={styles.searchModalInputContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchModalInput}
                                placeholder="Search for area, street name..."
                                placeholderTextColor="#999"
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {loadingSearch && (
                                <RNActivityIndicator
                                    style={styles.searchLoader}
                                    size="small"
                                    color="#e74c3c"
                                />
                            )}
                        </View>

                        {/* Location Notice */}
                        {!hasLocationPermission && (
                            <View style={styles.locationNoticeContainer}>
                                <View style={styles.locationNotice}>
                                    <Text style={styles.locationIcon}>📍</Text>
                                    <View style={styles.locationNoticeTextContainer}>
                                        <Text style={styles.locationNoticeTitle}>
                                            Device location not enabled
                                        </Text>
                                        <Text style={styles.locationNoticeSubtitle}>
                                            Tap here to enable your device location
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.enableButton}
                                        onPress={handleTurnOnLocation}>
                                        <Text style={styles.enableButtonText}>Enable</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Search Results */}
                        {showResults && predictions.length > 0 && (
                            <FlatList
                                data={predictions}
                                keyExtractor={item => item.place_id}
                                renderItem={renderPrediction}
                                style={styles.resultsList}
                                keyboardShouldPersistTaps="handled"
                            />
                        )}

                        {/* No Results */}
                        {showResults && predictions.length === 0 && !loadingSearch && (
                            <View style={styles.noResults}>
                                <Text style={styles.noResultsText}>No locations found</Text>
                            </View>
                        )}

                        {/* Ola Maps Attribution */}
                        <View style={styles.attribution}>
                            <Text style={styles.poweredByText}>powered by </Text>
                            <Text style={styles.olaText}>Ola Maps</Text>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

            {loadingLocation && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <RNActivityIndicator size="large" color="#e74c3c" />
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
    permissionBanner: {
        backgroundColor: '#ffcccc',
        padding: 10,
        alignItems: 'center',
    },
    permissionText: {
        color: '#cc0000',
        fontWeight: '500',
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
        shadowOffset: { width: 0, height: 2 },
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
        paddingVertical: 16,
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
        marginBottom: 16,
    },
    locationPin: {
        fontSize: 16,
        marginRight: 12,
    },
    addressTextContainer: {
        flex: 1,
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
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
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
    searchLoader: {
        marginLeft: 10,
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
    resultsList: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    predictionItem: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    mainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    secondaryText: {
        fontSize: 14,
        color: '#666',
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
    },
    attribution: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    poweredByText: {
        fontSize: 12,
        color: '#666',
    },
    olaText: {
        fontSize: 12,
        color: '#00A870',
        fontWeight: '600',
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
});

export default SetLocation;






