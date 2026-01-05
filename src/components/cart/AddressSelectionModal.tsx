import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartUIStore } from './store';
import { useAddressStore } from '../../store/address';

interface Props {
    onAddAddress: () => void;
}

export const AddressSelectionModal: React.FC<Props> = ({ onAddAddress }) => {
    const { showAddressModal, setShowAddressModal, selectedAddressId, setSelectedAddressId } = useCartUIStore();
    const { addresses } = useAddressStore();

    const handleSelectAddress = (addressId: number) => {
        setSelectedAddressId(addressId);
        setShowAddressModal(false);
    };

    const handleAddAddress = () => {
        setShowAddressModal(false);
        onAddAddress();
    };

    const getAddressDisplay = (addr: any): string => {
        return `${addr.completeAddress || ''}${addr.city ? `, ${addr.city}` : ''}${addr.landMark ? `, ${addr.landMark}` : ''
            }`;
    };

    return (
        <Modal
            visible={showAddressModal}
            animationType="slide"
            onRequestClose={() => setShowAddressModal(false)}
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Delivery Address</Text>
                    <TouchableOpacity onPress={() => setShowAddressModal(false)} style={styles.modalCloseButton}>
                        <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    {addresses.length === 0 ? (
                        <View style={styles.noAddressContainer}>
                            <MaterialIcons name="location-off" size={64} color={COLORS.textSecondary} />
                            <Text style={styles.noAddressTitle}>No addresses saved</Text>
                            <Text style={styles.noAddressSubtitle}>Add a delivery address to continue</Text>
                        </View>
                    ) : (
                        addresses.map((addr: any) => (
                            <TouchableOpacity
                                key={addr.id}
                                style={[
                                    styles.addressItem,
                                    selectedAddressId === addr.id && styles.addressItemSelected,
                                ]}
                                onPress={() => handleSelectAddress(addr.id)}
                            >
                                <View style={styles.addressItemContent}>
                                    <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                                    <View style={styles.addressItemDetails}>
                                        <Text style={styles.addressItemName}>{addr.receiverName}</Text>
                                        <Text style={styles.addressItemText} numberOfLines={2}>
                                            {getAddressDisplay(addr)}
                                        </Text>
                                        <Text style={styles.addressItemContact}>{addr.receiverContact}</Text>
                                    </View>
                                </View>
                                {addr.isDefault && <Text style={styles.defaultLabel}>DEFAULT</Text>}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
                        <MaterialIcons name="add-location" size={20} color={COLORS.white} />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};
