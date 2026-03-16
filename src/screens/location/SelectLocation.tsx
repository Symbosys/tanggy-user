import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAddressStore, Address } from '../../store/address';
import { useLocationStore } from '../../store/location';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const SelectLocation: React.FC<AppNavigation> = ({ navigation }) => {
    const { addresses, loading, fetchAddresses } = useAddressStore();
    const { setLocation, setPrimaryLocation, setSecondaryLocation } = useLocationStore();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [fetchAddresses, isAuthenticated]);

    const handleUseCurrentLocation = () => {
        navigation.navigate('select_your_location');
    };

    const handleAddAddress = () => {
        if (isAuthenticated) {
            navigation.navigate('AddAddress');
        } else {
            navigation.navigate('Login');
        }
    };

    const handleSelectAddress = (address: Address) => {
        const lat = address.latitude;
        const lng = address.longitude;

        if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
            setLocation(
                lat,
                lng,
                address.type || 'Other',
                address.completeAddress
            );
            navigation.goBack();
        } else {
            ToastAndroid.show('Location coordinates missing for this address', ToastAndroid.SHORT);
            console.warn('Address missing coordinates:', address);
        }
    };

    const renderAddressItem = ({ item }: { item: Address }) => {
        const icon = item.type === 'HOME' ? 'home' : item.type === 'WORK' ? 'work' : 'place';

        return (
            <TouchableOpacity
                style={styles.addressCard}
                onPress={() => handleSelectAddress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.addressIconContainer}>
                    <MaterialIcons name={icon} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.addressInfo}>
                    <Text style={styles.addressType}>{item.type}</Text>
                    <Text style={styles.addressDetails} numberOfLines={2}>
                        {item.completeAddress}
                    </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.muted} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Location</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={isAuthenticated ? addresses : []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAddressItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>

                        {/* Use Current Location Button */}
                        <TouchableOpacity
                            style={styles.currentLocationBtn}
                            onPress={handleUseCurrentLocation}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#fff', '#f8f9ff']}
                                style={styles.currentLocationGradient}
                            >
                                <View style={styles.currentLocationIcon}>
                                    <MaterialIcons name="my-location" size={22} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.currentLocationText}>Use current location</Text>
                                    <Text style={styles.currentLocationSubtext}>Using GPS</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Add New Address Button */}
                        <TouchableOpacity
                            style={styles.addAddressCardHeader}
                            onPress={handleAddAddress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.addAddressIconHeader}>
                                <MaterialIcons name="add" size={24} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addAddressTextHeader}>Add New Address</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
                        </TouchableOpacity>

                        {/* Section Title */}
                        <Text style={styles.sectionTitle}>
                            {isAuthenticated ? 'SAVED ADDRESSES' : 'LOGIN TO SEE SAVED ADDRESSES'}
                        </Text>
                    </>
                }
                ListEmptyComponent={
                    !isAuthenticated ? (
                        <View style={styles.loginCard}>
                            <MaterialIcons name="account-circle" size={50} color={COLORS.muted} />
                            <Text style={styles.loginTitle}>Please login to view saved addresses</Text>
                            <Text style={styles.loginSubtext}>
                                We will show your saved addresses here once you login.
                            </Text>
                            <TouchableOpacity
                                style={styles.loginBtn}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={styles.loginBtnText}>Login / Signup</Text>
                            </TouchableOpacity>
                        </View>
                    ) : loading ? (
                        <View style={styles.centerPadding}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="location-off" size={60} color={COLORS.muted} />
                            <Text style={styles.emptyText}>No saved addresses found</Text>
                            <TouchableOpacity
                                style={styles.addAddressBtn}
                                onPress={() => navigation.navigate('AddAddress')}
                            >
                                <Text style={styles.addAddressText}>Add New Address</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

export default SelectLocation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    listContent: {
        paddingBottom: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchPlaceholder: {
        marginLeft: 12,
        fontSize: 15,
        color: COLORS.muted,
    },
    currentLocationBtn: {
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    currentLocationGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    currentLocationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    currentLocationText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    currentLocationSubtext: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    addAddressCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addAddressIconHeader: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${COLORS.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    addAddressTextHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.muted,
        marginHorizontal: 16,
        marginBottom: 12,
        letterSpacing: 1,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    addressIconContainer: {
        marginRight: 16,
    },
    addressInfo: {
        flex: 1,
    },
    addressType: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    addressDetails: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    loginCard: {
        backgroundColor: COLORS.white,
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    loginTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 16,
        textAlign: 'center',
    },
    loginSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    loginBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    centerPadding: {
        padding: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    addAddressBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    addAddressText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
