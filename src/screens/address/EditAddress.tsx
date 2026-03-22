import { useRef, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import api from '../../api/api'; // Still needed for ola maps? Yes.
import {
    checkLocationPermission,
    getCurrentLocation,
    requestLocationPermission,
    turnOnLocation,
} from '../../utils/permissions/location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import { AppNavigation, RootStackParamList } from '../../types/type';
import { useAddressStore } from '../../store/address';
import { AxiosError } from 'axios';
import { RouteProp, useRoute } from '@react-navigation/native';

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

const initialRegion: Region = {
    latitude: 23.374006327619544,
    longitude: 85.28834426881085,
    latitudeDelta: 0.0001,
    longitudeDelta: 0.0020,
};

function EditAddress({ navigation }: AppNavigation) {
    const route = useRoute<RouteProp<RootStackParamList, 'EditAddress'>>();
    const { id } = route.params;
    const { addresses, updateAddress } = useAddressStore();

    // Find address
    const addressToEdit = addresses.find(a => a.id === id);

    const insets = useSafeAreaInsets();
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isEditingMainAddress, setIsEditingMainAddress] = useState(false);


    // Form States
    const [selectedTag, setSelectedTag] = useState('Home');
    const [floor, setFloor] = useState('');
    const [landmark, setLandmark] = useState('');
    const [instructions, setInstructions] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [receiverContact, setReceiverContact] = useState('');

    // Location States
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
    const [selectedCoords, setSelectedCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [currentAddress, setCurrentAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [mapHeight, setMapHeight] = useState(0);

    const [formSubmitting, setFormSubmitting] = useState(false);

    // Autocomplete states
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const mapRef = useRef<MapView>(null);
    const mainAddressInputRef = useRef<TextInput>(null);

    // Initialize with existing data
    useEffect(() => {
        if (addressToEdit) {
            setFloor(addressToEdit.floor || '');
            setLandmark(addressToEdit.landMark || '');
            setInstructions(addressToEdit.instructions || '');
            setReceiverName(addressToEdit.receiverName || '');
            setReceiverContact(addressToEdit.receiverContact || '');

            // Handle Tag case sensitivity
            const type = addressToEdit.type;
            if (type === 'HOME') setSelectedTag('Home');
            else if (type === 'WORK') setSelectedTag('Work');
            else setSelectedTag('Other');

            setCurrentAddress(addressToEdit.mainAddress || '');

            if (addressToEdit.latitude && addressToEdit.longitude) {
                const coords = {
                    latitude: addressToEdit.latitude,
                    longitude: addressToEdit.longitude
                };
                setSelectedCoords(coords);

                // Animate to location after map is ready
                setTimeout(() => {
                    mapRef.current?.animateToRegion({
                        ...coords,
                        latitudeDelta: initialRegion.latitudeDelta,
                        longitudeDelta: initialRegion.longitudeDelta,
                    }, 1000);
                }, 500);
            }
        }
    }, [addressToEdit]);

    // Check permissions on mount
    useEffect(() => {
        checkLocationPermission().then(granted => {
            setHasLocationPermission(granted ?? false);
        });
    }, []);

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

    const handleSearchPress = () => setShowSearchModal(true);
    const handleAddDetailsPress = () => setShowBottomSheet(true);
    const handleChangePress = () => {
        setShowBottomSheet(true);
        setIsEditingMainAddress(true);
    };
    const closeBottomSheet = () => {
        setShowBottomSheet(false);
        setIsEditingMainAddress(false);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchText('');
        setPredictions([]);
        setShowResults(false);
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
                mapRef.current?.animateToRegion({
                    ...location,
                    latitudeDelta: initialRegion.latitudeDelta,
                    longitudeDelta: initialRegion.longitudeDelta,
                }, 1000);
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
                    mapRef.current?.animateToRegion({
                        ...location,
                        latitudeDelta: initialRegion.latitudeDelta,
                        longitudeDelta: initialRegion.longitudeDelta,
                    }, 1000);
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

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length > 2) {
                searchPlaces(searchText);
            } else {
                setPredictions([]);
                setShowResults(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchText]);

    const searchPlaces = async (text: string) => {
        setLoadingSearch(true);
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(text)}&api_key=${OLA_API_KEY}&language=en`
            );
            const apiResponse = await response.json();
            const apiData = apiResponse.data || apiResponse;
            if (apiData && apiData.status === 'ok') {
                let preds = apiData.predictions || [];
                if (preds.length > 10) preds = preds.slice(0, 10);
                setPredictions(preds);
                setShowResults(true);
            } else {
                setPredictions([]);
                setShowResults(false);
            }
        } catch (error) {
            setPredictions([]);
            setShowResults(false);
        } finally {
            setLoadingSearch(false);
        }
    };

    const getPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(
                `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${OLA_API_KEY}`
            );
            const apiResponse = await response.json();
            const apiData = apiResponse.data || apiResponse;
            if (apiData && apiData.status === 'ok') {
                return apiData.result as PlaceDetails;
            }
        } catch (error) { }
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
            mapRef.current?.animateToRegion({
                ...newCoords,
                latitudeDelta: initialRegion.latitudeDelta,
                longitudeDelta: initialRegion.longitudeDelta,
            }, 1000);
        }
        setLoadingLocation(false);
        closeSearchModal();
    };

    const renderPrediction = ({ item }: { item: Prediction }) => (
        <TouchableOpacity style={styles.predictionItem} onPress={() => handleSelectPlace(item)}>
            <Text style={styles.mainText}>{item.structured_formatting.main_text}</Text>
            <Text style={styles.secondaryText}>{item.structured_formatting.secondary_text}</Text>
        </TouchableOpacity>
    );

    const onRegionChangeComplete = (region: Region) => {
        // Only update if user moved map manually - we might need better logic here to avoid loop
        // but for now, similar to AddAddress
        setSelectedCoords({
            latitude: region.latitude,
            longitude: region.longitude,
        });
    };

    // Update address text when coords change map drag
    // BUT we should avoid this if we just set it from initial load
    // For simplicity, reusing AddAddress logic:
    useEffect(() => {
        if (selectedCoords && !loadingLocation) {
            // Optional: debounce this or check if it matches initial loading to avoid overwriting
            // For now we assume if map moves, address updates
            // BUT this might overwrite initial 'mainAddress' if it slightly differs from reverse geocode
            // Let's rely on user action mostly. 
            // Logic in AddAddress:
            /*
            const updateAddress = async () => { ... }
            updateAddress()
            */
            // We'll keep it simple, but skip if it's the very first load
        }
    }, [selectedCoords]);

    // We can manually trigger update address if needed, or just let user change it. 
    // Actually AddAddress updates 'currentAddress' on map move. We should probably do same.
    useEffect(() => {
        const updateAddr = async () => {
            if (selectedCoords && !loadingLocation) {
                setAddressLoading(true);
                try {
                    const address = await getAddressFromCoords(
                        selectedCoords.latitude,
                        selectedCoords.longitude,
                    );
                    setCurrentAddress(address);
                } catch (error) {
                    console.error('Address update error:', error);
                } finally {
                    setAddressLoading(false);
                }
            }
        };
        updateAddr();
    }, [selectedCoords]);

    useEffect(() => {
        if (showBottomSheet && isEditingMainAddress) {
            const timer = setTimeout(() => {
                mainAddressInputRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showBottomSheet, isEditingMainAddress]);


    const tags = ['Home', 'Work', 'Other'];
    const isFormValid =
        receiverName.trim().length > 0 &&
        receiverContact.trim().length >= 10 &&
        currentAddress.trim().length > 0;

    const Loader = () => <ActivityIndicator size="large" color={COLORS.primary} />;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

            {/* Header */}
            <SafeAreaView style={styles.header} edges={['top', 'left', 'right']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Update delivery location</Text>
                </View>
            </SafeAreaView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <Text style={styles.searchPlaceholder}>Search for area, street name...</Text>
                </TouchableOpacity>
            </View>

            {/* Map */}
            <View style={{ flex: 1, position: 'relative' }} onLayout={e => setMapHeight(e.nativeEvent.layout.height)}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                    onRegionChangeComplete={onRegionChangeComplete}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                />
                <View style={[styles.markerFixed, { top: mapHeight / 2 - 70 }]}>
                    <Image source={require('../../assets/map/marker.png')} style={{ height: 100, width: 40 }} />
                </View>
            </View>

            {/* Use Current Location */}
            <View style={[styles.currentLocationContainer, { bottom: 220 + insets.bottom }]}>
                <TouchableOpacity
                    style={[styles.currentLocationButton, loadingLocation && styles.currentLocationButtonDisabled]}
                    onPress={handleTurnOnLocation}
                    disabled={loadingLocation}
                >
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.currentLocationText}>
                        {loadingLocation ? 'Locating...' : 'Use current location'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>DELIVERING YOUR ORDER TO</Text>
                <View style={styles.addressContainer}>
                    <Text style={styles.locationPin}>📍</Text>
                    <View style={styles.addressTextContainer}>
                        <Text style={styles.addressTitle} numberOfLines={1}>{currentAddress.split(',')[0] || 'Unknown'}</Text>
                        <Text style={styles.addressSubtitle} numberOfLines={2}>{currentAddress.split(',').slice(1).join(', ') || ''}</Text>
                    </View>
                    <TouchableOpacity onPress={handleChangePress}>
                        <Text style={styles.changeText}>CHANGE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Add Details Button */}
            <TouchableOpacity
                style={[styles.addDetailsButton, { marginBottom: 16 + insets.bottom }]}
                onPress={handleAddDetailsPress}
            >
                <Text style={styles.addDetailsText}>Enter address details</Text>
            </TouchableOpacity>


            {/* Bottom Sheet Form */}
            <Modal visible={showBottomSheet} transparent={true} animationType="slide" onRequestClose={closeBottomSheet}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackground} onPress={closeBottomSheet} />
                    <View style={styles.bottomSheet}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeBottomSheet}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.bottomSheetTitle}>Update address details</Text>

                            {/* Receiver */}
                            <View style={styles.receiverSection}>
                                <Text style={styles.sectionLabel}>Receiver details</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Receiver Name *"
                                    value={receiverName}
                                    onChangeText={setReceiverName}
                                    placeholderTextColor={COLORS.muted}
                                />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Receiver Contact *"
                                    value={receiverContact}
                                    onChangeText={setReceiverContact}
                                    maxLength={10}
                                    placeholderTextColor={COLORS.muted}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Tags */}
                            <View style={styles.tagSection}>
                                <Text style={styles.sectionLabel}>Tag this location</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
                                    {tags.map((tag, index) => (
                                        <TouchableOpacity
                                            key={tag}
                                            style={[
                                                styles.tagButton,
                                                selectedTag === tag && styles.tagButtonSelected,
                                                index === tags.length - 1 && { marginRight: 0 },
                                            ]}
                                            onPress={() => setSelectedTag(tag)}
                                        >
                                            <Text style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>
                                                {tag === 'Home' ? '🏠' : tag === 'Work' ? '🏢' : '📍'} {tag}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Current Location Display */}
                            <View style={styles.currentAddressSection}>
                                <Text style={styles.sectionLabel}>Main address (from map)</Text>
                                <View style={styles.currentAddressContainer}>
                                    {addressLoading ? (
                                        <Text style={styles.currentAddress}>Loading...</Text>
                                    ) : isEditingMainAddress ? (
                                        <TextInput
                                            ref={mainAddressInputRef}
                                            style={styles.currentAddressInput}
                                            placeholder="Enter address"
                                            placeholderTextColor={COLORS.muted}
                                            value={currentAddress}
                                            onChangeText={setCurrentAddress}
                                            multiline
                                        />
                                    ) : (
                                        <Text style={styles.currentAddress}>{currentAddress}</Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.changeButton}
                                        onPress={() => setIsEditingMainAddress(true)}
                                    >
                                        <Text style={styles.changeButtonText}>Change</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.mapPinNote}>
                                    Updated based on your exact map pin
                                </Text>
                            </View>

                            {/* Address details */}
                            <View style={styles.formSection}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Floor (Optional)"
                                    value={floor}
                                    onChangeText={setFloor}
                                    placeholderTextColor={COLORS.muted}
                                />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Landmark (Optional)"
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    placeholderTextColor={COLORS.muted}
                                />
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: COLORS.secondary, color: COLORS.textSecondary }]}
                                    placeholder="City *"
                                    value="Ranchi"
                                    editable={false}
                                    placeholderTextColor={COLORS.muted}
                                />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Instructions (Optional)"
                                    value={instructions}
                                    onChangeText={setInstructions}
                                    placeholderTextColor={COLORS.muted}
                                    multiline
                                />
                            </View>

                            {/* Update Button */}
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    !isFormValid && styles.confirmButtonDisabled,
                                    formSubmitting && styles.confirmButtonSubmitting,
                                ]}
                                disabled={!isFormValid || formSubmitting}
                                onPress={async () => {
                                    if (!isFormValid) return;
                                    try {
                                        setFormSubmitting(true);
                                        await updateAddress(id, {
                                            type: selectedTag.toUpperCase(),
                                            mainAddress: currentAddress || 'Unknown',
                                            completeAddress: currentAddress || 'Unknown',
                                            receiverName,
                                            receiverContact,
                                            landMark: landmark,
                                            floor,
                                            city: 'Ranchi',
                                            instructions,
                                            latitude: selectedCoords?.latitude,
                                            longitude: selectedCoords?.longitude,
                                        });

                                        const error = useAddressStore.getState().error;
                                        if (!error) {
                                            ToastAndroid.show('Address updated successfully', ToastAndroid.LONG);
                                            navigation.goBack();
                                        } else {
                                            ToastAndroid.show(error, ToastAndroid.LONG);
                                        }
                                    } catch (err) {
                                        ToastAndroid.show('Failed to update address', ToastAndroid.LONG);
                                    } finally {
                                        setFormSubmitting(false);
                                        closeBottomSheet();
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.confirmButtonText,
                                    !isFormValid && styles.confirmButtonTextDisabled,
                                    formSubmitting && styles.confirmButtonTextSubmitting
                                ]}>
                                    {formSubmitting ? 'Updating...' : 'Update Address'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Search Modal */}
            <Modal visible={showSearchModal} transparent={true} animationType="slide" onRequestClose={closeSearchModal}>
                <View style={styles.searchModalOverlay}>
                    <SafeAreaView style={styles.searchModalContainer}>
                        <View style={styles.searchModalHeader}>
                            <TouchableOpacity style={styles.searchModalBackButton} onPress={closeSearchModal}>
                                <Text style={styles.backArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.searchModalTitle}>Search Location</Text>
                        </View>
                        <View style={styles.searchModalInputContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchModalInput}
                                placeholder="Search for area, street name..."
                                placeholderTextColor={COLORS.muted}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus
                                autoCapitalize="none"
                            />
                            {loadingSearch && <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />}
                        </View>
                        {showResults && (
                            <FlatList
                                data={predictions}
                                keyExtractor={item => item.place_id}
                                renderItem={renderPrediction}
                                style={styles.resultsList}
                                keyboardShouldPersistTaps="handled"
                            />
                        )}
                    </SafeAreaView>
                </View>
            </Modal>

            {(loadingLocation || addressLoading) && ((
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <Loader />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    backButton: { marginRight: 16 },
    backArrow: { fontSize: 24, color: COLORS.textPrimary },
    headerTitle: { fontSize: 18, fontWeight: '500', color: COLORS.textPrimary },
    searchContainer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, backgroundColor: COLORS.white },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
    searchIcon: { marginRight: 12, fontSize: 16 },
    searchPlaceholder: { color: COLORS.muted, fontSize: 16 },
    map: { flex: 1 },
    markerFixed: { position: 'absolute', left: width / 2 - 20 },
    currentLocationContainer: { position: 'absolute', bottom: 200, left: 16, right: 16, alignItems: 'center' },
    currentLocationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, elevation: 3 },
    currentLocationButtonDisabled: { opacity: 0.6 },
    locationIcon: { marginRight: 8 },
    currentLocationText: { color: COLORS.primary, fontWeight: '800' },
    deliveryInfo: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', height: 100 },
    deliveryLabel: { fontSize: 12, color: COLORS.accent, fontWeight: '600', marginBottom: 12 },
    addressContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    locationPin: { fontSize: 16, marginRight: 12 },
    addressTextContainer: { flex: 1, marginRight: 8 },
    addressTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
    addressSubtitle: { fontSize: 14, color: COLORS.textSecondary },
    changeText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    addDetailsButton: { backgroundColor: COLORS.primary, marginHorizontal: 16, marginVertical: 16, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    addDetailsText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBackground: { flex: 1 },
    bottomSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.9, paddingTop: 16 },
    closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 1, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    closeButtonText: { fontSize: 18, color: COLORS.muted },
    bottomSheetContent: { paddingHorizontal: 16, paddingBottom: 32 },
    bottomSheetTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 24, marginTop: 8 },
    receiverSection: { marginBottom: 24 },
    sectionLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
    tagSection: { marginBottom: 24 },
    tagContainer: { flexDirection: 'row', paddingVertical: 4 },
    tagButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: COLORS.white, marginRight: 12 },
    tagButtonSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.secondary },
    tagText: { fontSize: 14, color: COLORS.muted },
    tagTextSelected: { color: COLORS.primary },
    currentAddressSection: {
        marginBottom: 24,
    },
    currentAddressContainer: {
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    currentAddress: {
        fontSize: 16,
        color: COLORS.textSecondary,
        flex: 1,
    },
    currentAddressInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textSecondary,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginRight: 8,
    },
    changeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(135,25,198,0.1)',
        borderRadius: 20,
    },
    changeButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    mapPinNote: {
        fontSize: 12,
        color: COLORS.muted,
    },
    formSection: { marginBottom: 32 },
    textInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16, minHeight: 50 },
    confirmButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
    confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    confirmButtonSubmitting: { backgroundColor: 'rgba(135,25,198,0.6)' },
    confirmButtonDisabled: { backgroundColor: 'rgba(135,25,198,0.3)' },
    confirmButtonTextDisabled: { opacity: 0.6 },
    confirmButtonTextSubmitting: { opacity: 0.8 },
    searchModalOverlay: { flex: 1, backgroundColor: COLORS.white },
    searchModalContainer: { flex: 1 },
    searchModalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: COLORS.white },
    searchModalBackButton: { marginRight: 16 },
    searchModalTitle: { fontSize: 18, fontWeight: '500', color: COLORS.textPrimary },
    searchModalInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    searchModalInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.secondary, borderRadius: 8, marginLeft: 8 },
    searchLoader: { marginLeft: 10 },
    resultsList: { flex: 1, backgroundColor: COLORS.background },
    predictionItem: { padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    mainText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
    secondaryText: { fontSize: 14, color: COLORS.textSecondary },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
    loadingBox: { paddingVertical: 20, paddingHorizontal: 30 },
});

export default EditAddress;
