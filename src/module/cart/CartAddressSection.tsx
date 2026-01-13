import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cartStyles as styles } from './styles';
import { useCartUIStore } from './store';
import { useAddressStore } from '../../store/address';

export const CartAddressSection: React.FC = () => {
    const { setShowAddressModal, selectedAddressId } = useCartUIStore();
    const { addresses } = useAddressStore();

    const defaultAddress = selectedAddressId
        ? addresses.find((addr: any) => addr.id === selectedAddressId)
        : addresses.find((addr: any) => addr.isDefault);

    const addressText = defaultAddress
        ? `${defaultAddress.completeAddress}, ${defaultAddress.city || ''}${defaultAddress.landMark ? `, ${defaultAddress.landMark}` : ''
        }`
        : 'Select delivery address';

    return (
        <View style={styles.addressSection}>
            <TouchableOpacity style={styles.addressCard} onPress={() => setShowAddressModal(true)}>
                <View style={styles.addressContent}>
                    <Text style={styles.addressTitle}>Delivery Address</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {addressText}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                    <Text style={styles.changeButton}>Change</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};
