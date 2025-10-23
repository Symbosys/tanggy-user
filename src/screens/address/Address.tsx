import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { useAddressStore } from '../../store/address';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const AddressScreen = ({ navigation }: { navigation: any }) => {
    const {
        addresses,
        loading,
        error,
        fetchAddresses,
        deleteAddress,
        setDefaultAddress,
    } = useAddressStore();

    useEffect(() => {
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8719C6" />
                <Text style={styles.loadingText}>Loading your addresses...</Text>
            </View>
        );
    }

    if (error || !addresses || addresses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <View
                        style={[
                            styles.emptyIconGradient,
                            { backgroundColor: '#8719C6' }
                        ]}>
                        <Icon name="location-off" size={60} color="#fff" />
                    </View>
                </View>
                <Text style={styles.emptyTitle}>No Address Found</Text>
                <Text style={styles.emptySubtitle}>
                    Add your delivery address to continue ordering
                </Text>
                <TouchableOpacity
                    style={styles.addFirstButton}
                    onPress={() => navigation.navigate('AddAddress')}>
                    <View
                        style={[
                            styles.addFirstButtonGradient,
                            { backgroundColor: '#8719C6' }
                        ]}>
                        <Icon name="add-location" size={24} color="#fff" />
                        <Text style={styles.addFirstButtonText}>
                            Add Your First Address
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.headerGradient,
                    { backgroundColor: '#8719C6' }
                ]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Addresses</Text>
                    <View style={styles.headerRight}>
                        <View style={styles.addressCount}>
                            <Text style={styles.addressCountText}>{addresses.length}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {addresses.map(addr => (
                    <View key={addr.id} style={styles.addressCard}>
                        {addr.isDefault && (
                            <View style={styles.defaultRibbon}>
                                <View
                                    style={[
                                        styles.ribbonGradient,
                                        { backgroundColor: '#8719C6' }
                                    ]}>
                                    <Icon name="verified" size={14} color="#fff" />
                                    <Text style={styles.ribbonText}>DEFAULT</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.addressCardContent}>
                            <View style={styles.addressHeader}>
                                <View style={styles.addressTypeContainer}>
                                    <View
                                        style={[
                                            styles.addressIconCircle,
                                            addr.type === 'HOME'
                                                ? styles.homeIcon
                                                : addr.type === 'WORK'
                                                    ? styles.workIcon
                                                    : styles.otherIcon,
                                        ]}>
                                        <Text style={styles.addressIcon}>
                                            {addr.type === 'HOME'
                                                ? '🏠'
                                                : addr.type === 'WORK'
                                                    ? '🏢'
                                                    : '📍'}
                                        </Text>
                                    </View>
                                    <Text style={styles.addressType}>
                                        {addr.type === 'HOME'
                                            ? 'Home'
                                            : addr.type === 'WORK'
                                                ? 'Work'
                                                : 'Other'}
                                    </Text>
                                </View>

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() =>
                                            navigation.navigate('EditAddress', { id: addr.id })
                                        }>
                                        <Icon name="edit" size={18} color="#8719C6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() =>
                                            Alert.alert(
                                                'Delete Address',
                                                'Are you sure you want to delete this address?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        onPress: () => deleteAddress(addr.id),
                                                        style: 'destructive',
                                                    },
                                                ],
                                            )
                                        }>
                                        <Icon name="delete" size={18} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.addressDetails}>
                                <View style={styles.detailRow}>
                                    <Icon name="location-on" size={18} color="#8719C6" />
                                    <Text style={styles.addressText}>{addr.completeAddress}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Icon name="phone" size={18} color="#8719C6" />
                                    <Text style={styles.phoneText}>{addr.receiverContact}</Text>
                                </View>
                                {addr.receiverName && (
                                    <View style={styles.detailRow}>
                                        <Icon name="person" size={18} color="#8719C6" />
                                        <Text style={styles.phoneText}>{addr.receiverName}</Text>
                                    </View>
                                )}
                            </View>

                            {!addr.isDefault && (
                                <TouchableOpacity
                                    style={styles.defaultButton}
                                    onPress={() => setDefaultAddress(addr.id)}>
                                    <View
                                        style={[
                                            styles.defaultButtonGradient,
                                            { backgroundColor: '#f9eae9' }
                                        ]}>
                                        <Icon name="check-circle" size={18} color="#8719C6" />
                                        <Text style={styles.defaultButtonText}>Set as Default</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddAddress')}>
                    <View
                        style={[
                            styles.addButtonGradient,
                            { backgroundColor: '#8719C6' }
                        ]}>
                        <Icon name="add-circle" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Add New Address</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9eae9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9eae9',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8719C6',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9eae9',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        marginBottom: 32,
    },
    emptyIconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    addFirstButton: {
        width: width - 64,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    addFirstButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 12,
    },
    addFirstButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerGradient: {
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    addressCount: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressCountText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    defaultRibbon: {
        position: 'absolute',
        top: 16,
        right: -30,
        width: 120,
        transform: [{ rotate: '45deg' }],
        zIndex: 10,
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    ribbonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        gap: 4,
    },
    ribbonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    addressCardContent: {
        padding: 20,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addressIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeIcon: {
        backgroundColor: '#e8f5e9',
    },
    workIcon: {
        backgroundColor: '#e3f2fd',
    },
    otherIcon: {
        backgroundColor: '#fff3e0',
    },
    addressIcon: {
        fontSize: 24,
    },
    addressType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f9eae9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16,
    },
    addressDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    phoneText: {
        flex: 1,
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    defaultButton: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#8719C6',
    },
    defaultButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    defaultButtonText: {
        color: '#8719C6',
        fontSize: 15,
        fontWeight: 'bold',
    },
    addButton: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 20,
    },
});

export default AddressScreen;