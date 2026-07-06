import React, { useState, useMemo } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';
import { useUserRefunds, RefundRequest } from '../../api/hooks/useRefund';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RefundScreen = ({ navigation }: any) => {
  const { data, isLoading, isError, refetch, isFetching } = useUserRefunds({
    page: 1,
    limit: 100,
  });

  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  const refunds = data?.refunds || [];

  // Summary Metrics
  const stats = useMemo(() => {
    let totalRefunded = 0;
    let pendingCount = 0;
    refunds.forEach((ref) => {
      const amount = parseToDecimal(ref.amount as any);
      if (ref.status.toUpperCase() === 'REFUNDED' || ref.status.toUpperCase() === 'SUCCESS') {
        totalRefunded += amount;
      } else if (ref.status.toUpperCase() === 'PENDING') {
        pendingCount += 1;
      }
    });
    return { totalRefunded, pendingCount };
  }, [refunds]);

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REFUNDED':
      case 'SUCCESS':
        return {
          color: '#059669', // Emerald
          dotColor: '#10B981',
          label: 'Processed',
        };
      case 'PENDING':
        return {
          color: '#D97706', // Amber
          dotColor: '#F59E0B',
          label: 'Pending Approval',
        };
      case 'FAILED':
      case 'REJECTED':
        return {
          color: '#DC2626', // Red
          dotColor: '#EF4444',
          label: 'Rejected',
        };
      default:
        return {
          color: '#4B5563', // Gray
          dotColor: '#6B7280',
          label: status,
        };
    }
  };

  const formatReason = (reason: string) => {
    if (!reason) return 'Order cancellation';
    return reason.replace(/_/g, ' ').toLowerCase();
  };

  const renderRefundItem = ({ item }: { item: RefundRequest }) => {
    const config = getStatusConfig(item.status);
    const amountVal = parseToDecimal(item.amount as any);

    return (
      <TouchableOpacity
        style={styles.refundCard}
        onPress={() => setSelectedRefund(item)}
        activeOpacity={0.6}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: config.dotColor }]} />
            <Text style={[styles.statusLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.orderNumber}>
            #{item.order?.orderNumber || item.orderId}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.reasonText}>
            For {formatReason(item.reason)}
          </Text>
          <Text style={styles.amountText}>
            ₹{amountVal.toFixed(2)}
          </Text>
        </View>

        {item.description ? (
          <View style={styles.cardFooter}>
            <Text style={styles.notesText} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refunds</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sleek Summary Row */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Refunded</Text>
          <Text style={styles.summaryValue}>₹{stats.totalRefunded.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending Refunds</Text>
          <Text style={styles.summaryValue}>{stats.pendingCount}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={40} color="#EF4444" />
          <Text style={styles.errorText}>Something went wrong</Text>
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
              <MaterialIcon name="wallet-giftcard" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No refunds found</Text>
              <Text style={styles.emptySubText}>
                When an order gets cancelled, your refund history will appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* Details Sheet Modal */}
      <Modal
        visible={!!selectedRefund}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRefund(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismissTrigger} 
            activeOpacity={1} 
            onPress={() => setSelectedRefund(null)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refund Summary</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRefund(null)}>
                <Icon name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {selectedRefund ? (
              <View style={styles.modalBody}>
                <View style={styles.amountDisplay}>
                  <Text style={styles.amountDisplayValue}>
                    ₹{parseToDecimal(selectedRefund.amount as any).toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: getStatusConfig(selectedRefund.status).color }
                  ]}>
                    {getStatusConfig(selectedRefund.status).label}
                  </Text>
                </View>

                <View style={styles.detailsGroup}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference ID</Text>
                    <Text style={styles.detailValueText}>{selectedRefund.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order ID</Text>
                    <Text style={styles.detailValueText}>
                      #{selectedRefund.order?.orderNumber || selectedRefund.orderId}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <Text style={[styles.detailValueText, styles.capitalizeText]}>
                      {formatReason(selectedRefund.reason)}
                    </Text>
                  </View>

                  {selectedRefund.order?.createdAt ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Date</Text>
                      <Text style={styles.detailValueText}>
                        {new Date(selectedRefund.order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {selectedRefund.processedAt ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Processed Date</Text>
                      <Text style={styles.detailValueText}>
                        {new Date(selectedRefund.processedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {selectedRefund.referenceId ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gateway Ref</Text>
                      <Text style={styles.detailValueText}>
                        {selectedRefund.referenceId}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {selectedRefund.description ? (
                  <View style={styles.notesBlock}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesContent}>{selectedRefund.description}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  refundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  reasonText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
    paddingRight: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    justifyContent: 'flex-end',
  },
  modalDismissTrigger: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 20,
  },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  amountDisplayValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsGroup: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValueText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  capitalizeText: {
    textTransform: 'capitalize',
  },
  notesBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
});

export default RefundScreen;
