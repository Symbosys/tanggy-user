import React, { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAddressStore } from '../../store/address';
import { AppNavigation } from '../../types/type';
import { COLORS } from "../../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const MyAddressesScreen: React.FC<AppNavigation> = ({ navigation }) => {
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
    }, [fetchAddresses]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your addresses...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const hasAddresses = addresses && addresses.length > 0;

    const handleEditAddress = (id: number) => {
        // navigation.navigate('EditAddress', { id });
    };

    const handleDeleteAddress = (id: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => deleteAddress(id),
                    style: 'destructive',
                },
            ],
        );
    };

    const handleSetDefault = (id: number) => {
        setDefaultAddress(id);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={26} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Addresses</Text>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('AddAddress')}
                >
                    <MaterialIcons name="add-location-alt" size={26} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {hasAddresses ? (
                    addresses.map((addr) => {
                        const label = addr.type === 'HOME' ? 'Home' : addr.type === 'WORK' ? 'Work' : 'Other';
                        const icon = addr.type === 'HOME' ? 'home' : addr.type === 'WORK' ? 'work' : 'pin-drop';
                        const description = addr.completeAddress;

                        return (
                            <View
                                key={addr.id}
                                style={[
                                    styles.addressCard,
                                    addr.isDefault && styles.defaultAddressCard,
                                ]}
                            >
                                {addr.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>Default</Text>
                                    </View>
                                )}

                                <View style={styles.cardContent}>
                                    <View style={styles.iconCircle}>
                                        <MaterialIcons
                                            name={icon}
                                            size={24}
                                            color={COLORS.primary}
                                        />
                                    </View>
                                    <View style={styles.addressTextContainer}>
                                        <Text style={styles.addressTitle}>{label}</Text>
                                        <Text style={styles.addressDescription}>
                                            {description}
                                        </Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleEditAddress(addr.id)}
                                        >
                                            <MaterialIcons
                                                name="edit"
                                                size={20}
                                                color={COLORS.textSecondary}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteAddress(addr.id)}
                                        >
                                            <MaterialIcons
                                                name="delete"
                                                size={20}
                                                color={COLORS.highlight}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {!addr.isDefault && (
                                    <TouchableOpacity
                                        style={styles.setDefaultButton}
                                        onPress={() => handleSetDefault(addr.id)}
                                    >
                                        <Text style={styles.setDefaultText}>Set as Default</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })
                ) : (
                    // Empty state
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="location-off"
                            size={64}
                            color={COLORS.muted}
                        />
                        <Text style={styles.emptyTitle}>No Addresses Saved Yet</Text>
                        <Text style={styles.emptyDescription}>
                            Add your home or work address for faster checkouts.
                        </Text>
                        <TouchableOpacity
                            style={styles.addEmptyButton}
                            onPress={() => navigation.navigate('AddAddress')}
                        >
                            <MaterialIcons name="add" size={20} color={COLORS.white} />
                            <Text style={styles.addEmptyButtonText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Floating Add Button */}
            {hasAddresses && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddAddress')}
                    >
                        <MaterialIcons name="add" size={24} color={COLORS.white} />
                        <Text style={styles.addButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default MyAddressesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.white,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 12,
        gap: 12,
    },
    addressCard: {
        borderRadius: 12,
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 12,
        gap: 8,
    },
    defaultAddressCard: {
        borderColor: COLORS.accent,
        borderWidth: 2,
    },
    defaultBadge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: COLORS.accent,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    defaultText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: "center",
        justifyContent: "center",
    },
    addressTextContainer: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textPrimary,
    },
    addressDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    setDefaultButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
    },
    setDefaultText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        gap: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textPrimary,
        marginTop: 12,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    addEmptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    addEmptyButtonText: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 15,
    },
    fabContainer: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 30,
        width: "100%",
        maxWidth: 360,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 15,
    },
});