import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, getStatusLabel } from './constants';

interface SwitchOrderModalProps {
  isVisible: boolean;
  onClose: () => void;
  ongoingOrders: any[];
  currentId: string | undefined;
  currentOrderNumber: string | undefined;
  handleSwitchOrder: (id: string, orderNumber: string) => void;
}

export const SwitchOrderModal: React.FC<SwitchOrderModalProps> = ({
  isVisible,
  onClose,
  ongoingOrders,
  currentId,
  currentOrderNumber,
  handleSwitchOrder,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Order</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {ongoingOrders.map((ongoingOrder: any) => {
          const ongoingOrderIdStr = ongoingOrder.id?.toString();
          const isSelected =
            currentId === ongoingOrderIdStr ||
            currentOrderNumber === ongoingOrder.orderNumber;
          return (
            <TouchableOpacity
              key={ongoingOrderIdStr || ongoingOrder.orderNumber}
              style={[styles.orderOption, isSelected && styles.orderOptionSelected]}
              onPress={() =>
                handleSwitchOrder(ongoingOrderIdStr, ongoingOrder.orderNumber)
              }
            >
              <View style={styles.optionRow}>
                {/* Radio Button */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.orderStore}>Order #{ongoingOrder.orderNumber}</Text>
                  <Text style={styles.orderMeta}>
                    {ongoingOrder.items?.length || 0} items | ₹
                    {ongoingOrder.paidAmount || ongoingOrder.subtotal}
                  </Text>
                  <Text style={styles.orderStatus}>{getStatusLabel(ongoingOrder.status)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 250,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  orderOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderOptionSelected: {
    backgroundColor: '#f9f9f9',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  textContainer: {
    marginLeft: 12,
  },
  orderStore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
