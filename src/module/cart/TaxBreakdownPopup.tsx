import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../../theme/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface TaxBreakdownPopupProps {
    visible: boolean;
    onClose: () => void;
    // New breakdown props
    gstOnItemTotal: number;
    gstOnDeliveryFee: number;
    gstOnPlatform: number;
    gstOnPackingFee: number;
    totalGstAmount: number;
}

const TaxBreakdownPopup = ({
    visible,
    onClose,
    gstOnItemTotal,
    gstOnDeliveryFee,
    gstOnPlatform,
    gstOnPackingFee,
    totalGstAmount,
}: TaxBreakdownPopupProps) => {

    // Helper to render a row only if amount > 0
    const renderRow = (label: string, amount: number) => {
        if (amount <= 0) return null;
        return (
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>₹{amount.toFixed(2)}</Text>
            </View>
        );
    };

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
                        {renderRow("GST on Items Total", gstOnItemTotal)}
                        {renderRow("GST on Delivery Fee", gstOnDeliveryFee)}
                        {renderRow("GST on Platform Fee", gstOnPlatform)}
                        {renderRow("GST on Packing Fee", gstOnPackingFee)}

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <View style={styles.gstLabelContainer}>
                                <Text style={styles.totalLabel}>Total Tax</Text>
                            </View>
                            <Text style={styles.totalValue}>₹{totalGstAmount.toFixed(2)}</Text>
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
