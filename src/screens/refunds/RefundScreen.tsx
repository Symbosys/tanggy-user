import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { useUserRefunds, RefundRequest } from '../../api/hooks/useRefund';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');

const RefundScreen = ({ navigation }: any) => {
  const { data, isLoading, isError, refetch, isFetching } = useUserRefunds({
    page: 1,
    limit: 100,
  });

  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  const refunds = data?.refunds || [];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REFUNDED':
      case 'SUCCESS':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'FAILED':
      case 'REJECTED':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const formatReason = (reason: string) => {
    if (!reason) return 'N/A';
    return reason.replace(/_/g, ' ');
  };

  const renderRefundItem = ({ item }: { item: RefundRequest }) => {
    const statusColor = getStatusColor(item.status);
    const amountVal = parseToDecimal(item.amount as any);

    return (
      <TouchableOpacity
        style={styles.refundCard}
        onPress={() => setSelectedRefund(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumberLabel}>Order ID</Text>
            <Text style={styles.orderNumberValue}>{item.order?.orderNumber || item.orderId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Refund Amount</Text>
              <Text style={styles.amountText}>₹{amountVal.toFixed(2)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Reason</Text>
              <Text style={styles.reasonText}>{formatReason(item.reason)}</Text>
            </View>
          </View>

          {item.referenceId ? (
            <View style={styles.metaRow}>
              <Icon name="payment" size={16} color={COLORS.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                Ref ID: <Text style={styles.metaValue}>{item.referenceId}</Text>
              </Text>
            </View>
          ) : null}

          {item.description ? (
            <View style={styles.metaRow}>
              <Icon name="comment" size={16} color={COLORS.accent || '#888'} />
              <Text style={styles.metaText} numberOfLines={2}>
                Notes: <Text style={styles.metaValue}>{item.description}</Text>
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Refunds</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading refunds...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>Failed to load refunds</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={refunds}
          renderItem={renderRefundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="money-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No refunds found</Text>
              <Text style={styles.emptySubText}>
                Your refund requests will appear here when an order gets cancelled.
              </Text>
            </View>
          }
        />
      )}

      {/* Details Modal */}
      <Modal
        visible={!!selectedRefund}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedRefund(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refund Details</Text>
              <TouchableOpacity onPress={() => setSelectedRefund(null)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedRefund ? (
              <View style={styles.modalBody}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Refund ID</Text>
                  <Text style={styles.modalValueText}>{selectedRefund.id}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Order ID</Text>
                  <Text style={styles.modalValueText}>
                    {selectedRefund.order?.orderNumber || selectedRefund.orderId}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Refund Amount</Text>
                  <Text style={[styles.modalValueText, { fontWeight: 'bold', color: COLORS.primary }]}>
                    ₹{parseToDecimal(selectedRefund.amount as any).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <Text
                    style={[
                      styles.modalValueText,
                      { fontWeight: 'bold', color: getStatusColor(selectedRefund.status) },
                    ]}
                  >
                    {selectedRefund.status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Cancellation Reason</Text>
                  <Text style={styles.modalValueText}>{formatReason(selectedRefund.reason)}</Text>
                </View>

                {selectedRefund.order?.createdAt ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Request Date</Text>
                    <Text style={styles.modalValueText}>
                      {new Date(selectedRefund.order.createdAt).toLocaleString()}
                    </Text>
                  </View>
                ) : null}

                {selectedRefund.processedAt ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Processed Date</Text>
                    <Text style={styles.modalValueText}>
                      {new Date(selectedRefund.processedAt).toLocaleString()}
                    </Text>
                  </View>
                ) : null}

                {selectedRefund.referenceId ? (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Transaction Ref ID</Text>
                    <Text style={[styles.modalValueText, styles.monoText]}>
                      {selectedRefund.referenceId}
                    </Text>
                  </View>
                ) : null}

                {selectedRefund.description ? (
                  <View style={styles.modalNotesBlock}>
                    <Text style={styles.modalNotesLabel}>Admin Notes / Remarks</Text>
                    <Text style={styles.modalNotesText}>{selectedRefund.description}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  refundCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  orderNumberValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  metaValue: {
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    gap: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  modalNotesBlock: {
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  modalNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalNotesText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
});

export default RefundScreen;
