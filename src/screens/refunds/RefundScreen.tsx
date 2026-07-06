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
import LinearGradient from 'react-native-linear-gradient';
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

  // Calculate quick stats
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
          color: '#10B981',
          bg: '#E6F4EA',
          icon: 'check-circle-outline',
          label: 'Processed',
        };
      case 'PENDING':
        return {
          color: '#F59E0B',
          bg: '#FFF3E0',
          icon: 'clock-outline',
          label: 'Pending Approval',
        };
      case 'FAILED':
      case 'REJECTED':
        return {
          color: '#EF4444',
          bg: '#FCE8E6',
          icon: 'alert-circle-outline',
          label: 'Failed / Rejected',
        };
      default:
        return {
          color: '#6B7280',
          bg: '#F3F4F6',
          icon: 'help-circle-outline',
          label: status,
        };
    }
  };

  const formatReason = (reason: string) => {
    if (!reason) return 'Cancelled Order';
    return reason.replace(/_/g, ' ');
  };

  const renderRefundItem = ({ item }: { item: RefundRequest }) => {
    const config = getStatusConfig(item.status);
    const amountVal = parseToDecimal(item.amount as any);

    return (
      <TouchableOpacity
        style={styles.refundCard}
        onPress={() => setSelectedRefund(item)}
        activeOpacity={0.8}
      >
        {/* Color bar on the left */}
        <View style={[styles.cardColorBar, { backgroundColor: config.color }]} />

        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>ORDER NUMBER</Text>
              <Text style={styles.orderNumber}>{item.order?.orderNumber || item.orderId}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: config.bg }]}>
              <MaterialIcon name={config.icon} size={14} color={config.color} />
              <Text style={[styles.statusLabel, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Refund Amount</Text>
              <Text style={[styles.amountValue, { color: config.color }]}>₹{amountVal.toFixed(2)}</Text>
            </View>
            <View style={styles.reasonSection}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.reasonValue}>{formatReason(item.reason)}</Text>
            </View>
          </View>

          {(item.referenceId || item.description) && (
            <View style={styles.cardFooter}>
              {item.referenceId ? (
                <View style={styles.footerRow}>
                  <Icon name="receipt" size={14} color="#888" />
                  <Text style={styles.footerText} numberOfLines={1}>
                    Ref: <Text style={styles.footerValue}>{item.referenceId}</Text>
                  </Text>
                </View>
              ) : null}
              {item.description ? (
                <View style={styles.footerRow}>
                  <Icon name="rate-review" size={14} color="#888" />
                  <Text style={styles.footerText} numberOfLines={1}>
                    Remarks: <Text style={styles.footerValue}>{item.description}</Text>
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Profile Section */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent || '#1e293b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
          <View style={styles.headerBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-ios" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Refund History</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Refunded</Text>
              <Text style={styles.statValue}>₹{stats.totalRefunded.toFixed(2)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pending Refunds</Text>
              <View style={styles.pendingRow}>
                <Text style={styles.statValue}>{stats.pendingCount}</Text>
                {stats.pendingCount > 0 && <View style={styles.pendingDot} />}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching refund updates...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <MaterialIcon name="alert-decagram-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load refund requests</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
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
              <MaterialIcon name="cash-refund" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>No refunds yet</Text>
              <Text style={styles.emptySubText}>
                When any of your orders are cancelled, refund records will appear here automatically.
              </Text>
            </View>
          }
        />
      )}

      {/* Details Bottom Sheet Modal */}
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
            <View style={styles.modalIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Breakdown</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRefund(null)}>
                <Icon name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {selectedRefund ? (
              <View style={styles.modalBody}>
                <View style={styles.amountCard}>
                  <Text style={styles.amountCardLabel}>Refund Amount</Text>
                  <Text style={styles.amountCardValue}>
                    ₹{parseToDecimal(selectedRefund.amount as any).toFixed(2)}
                  </Text>
                  <View style={[
                    styles.statusBadgeLarge, 
                    { backgroundColor: `${getStatusConfig(selectedRefund.status).color}15` }
                  ]}>
                    <Text style={[styles.statusBadgeTextLarge, { color: getStatusConfig(selectedRefund.status).color }]}>
                      {getStatusConfig(selectedRefund.status).label.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsList}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Refund Reference ID</Text>
                    <Text style={styles.detailValueText}>{selectedRefund.id}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Order ID</Text>
                    <Text style={[styles.detailValueText, styles.boldText]}>
                      #{selectedRefund.order?.orderNumber || selectedRefund.orderId}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Refund Reason</Text>
                    <Text style={styles.detailValueText}>{formatReason(selectedRefund.reason)}</Text>
                  </View>

                  {selectedRefund.order?.createdAt ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Order Placed On</Text>
                      <Text style={styles.detailValueText}>
                        {new Date(selectedRefund.order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {selectedRefund.processedAt ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Processed At</Text>
                      <Text style={styles.detailValueText}>
                        {new Date(selectedRefund.processedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {selectedRefund.referenceId ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gateway Transaction ID</Text>
                      <Text style={[styles.detailValueText, styles.monoText]}>
                        {selectedRefund.referenceId}
                      </Text>
                    </View>
                  ) : null}

                  {selectedRefund.description ? (
                    <View style={styles.notesContainer}>
                      <View style={styles.notesHeader}>
                        <MaterialIcon name="comment-text-outline" size={16} color="#D97706" />
                        <Text style={styles.notesTitle}>Admin Remarks</Text>
                      </View>
                      <Text style={styles.notesContent}>{selectedRefund.description}</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity 
                  style={[styles.doneButton, { backgroundColor: getStatusConfig(selectedRefund.status).color }]} 
                  onPress={() => setSelectedRefund(null)}
                >
                  <Text style={styles.doneButtonText}>Close details</Text>
                </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  gradientHeader: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  refundCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardColorBar: {
    width: 6,
  },
  cardMain: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  reasonSection: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  reasonLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
  },
  reasonValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    textAlign: 'right',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  footerValue: {
    fontWeight: '600',
    color: '#334155',
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
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalDismissTrigger: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: screenHeight * 0.85,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    gap: 20,
  },
  amountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountCardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  amountCardValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeTextLarge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsList: {
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValueText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  boldText: {
    fontWeight: '800',
  },
  monoText: {
    fontFamily: 'monospace',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  notesContainer: {
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesContent: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    fontWeight: '500',
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default RefundScreen;
