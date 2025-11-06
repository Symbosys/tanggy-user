import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../theme/theme"; // ✅ Import your theme

interface AddressItem {
    id: string;
    label: string;
    description: string;
    icon: string;
    isDefault?: boolean;
}

const addresses: AddressItem[] = [
    {
        id: "1",
        label: "Home",
        description:
            "A-123, Minta Apartments, Fresh Fields, Metro City - 400001",
        icon: "home",
        isDefault: true,
    },
    {
        id: "2",
        label: "Work",
        description:
            "Tech Park, 9th Floor, Innovation Tower, Business Bay - 400002",
        icon: "work",
    },
    {
        id: "3",
        label: "Other",
        description:
            "Plot 42, Green Valley, Near Lakeview, Metro City - 400003",
        icon: "pin-drop",
    },
];

const MyAddressesScreen: React.FC = () => {
    const hasAddresses = addresses.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={26} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Addresses</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="add-location-alt" size={26} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {hasAddresses ? (
                    addresses.map((item) => (
                        <View
                            key={item.id}
                            style={[
                                styles.addressCard,
                                item.isDefault && styles.defaultAddressCard,
                            ]}
                        >
                            {item.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}

                            <View style={styles.cardContent}>
                                <View style={styles.iconCircle}>
                                    <MaterialIcons
                                        name={item.icon}
                                        size={24}
                                        color={COLORS.primary}
                                    />
                                </View>
                                <View style={styles.addressTextContainer}>
                                    <Text style={styles.addressTitle}>{item.label}</Text>
                                    <Text style={styles.addressDescription}>
                                        {item.description}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <MaterialIcons
                                            name="edit"
                                            size={20}
                                            color={COLORS.textSecondary}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton}>
                                        <MaterialIcons
                                            name="delete"
                                            size={20}
                                            color={COLORS.highlight}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
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
                    </View>
                )}
            </ScrollView>

            {/* Floating Add Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.addButton}>
                    <MaterialIcons name="add" size={24} color={COLORS.white} />
                    <Text style={styles.addButtonText}>Add New Address</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default MyAddressesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        padding: 12,
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
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
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
