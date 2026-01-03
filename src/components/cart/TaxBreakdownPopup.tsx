import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../../theme/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface TaxBreakdownPopupProps {
    visible: boolean;
    onClose: () => void;
    itemTotal: number;
    deliveryFee: number;
    tipAmount: number;
    gstAmount: number;
    packingFee?: number;
}

const TaxBreakdownPopup = ({
    visible,
    onClose,
    itemTotal,
    deliveryFee,
    tipAmount,
    gstAmount,
    packingFee = 0,
}: TaxBreakdownPopupProps) => {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.popup}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Tax Breakdown</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.label}>GST on Subtotal (5%)</Text>
                            <Text style={styles.value}>₹{(itemTotal * 0.05).toFixed(2)}</Text>
                        </View>
                        {packingFee > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>GST on Packing (18%)</Text>
                                <Text style={styles.value}>₹{(packingFee * 0.18).toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.label}>GST on Delivery Fee (18%)</Text>
                            <Text style={styles.value}>₹{(deliveryFee * 0.18).toFixed(2)}</Text>
                        </View>
                        {tipAmount > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>GST on Tip</Text>
                                <Text style={styles.value}>₹0.00</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <View style={styles.gstLabelContainer}>
                                <Text style={styles.totalLabel}>Total Tax</Text>
                            </View>
                            <Text style={styles.totalValue}>₹{gstAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: width * 0.85,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    content: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
    gstLabelContainer: {
        flex: 1,
    },
    gstNote: {
        fontSize: 10,
        color: COLORS.muted,
        marginTop: 2,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
});

export default TaxBreakdownPopup;
