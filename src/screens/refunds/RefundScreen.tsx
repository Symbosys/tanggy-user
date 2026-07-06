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
          color: '#10B981', // Emerald
          bg: '#ECFDF5',
          icon: 'check-circle-outline',
          label: 'Processed',
          statusIcon: 'checkbox-marked-circle',
        };
      case 'PENDING':
        return {
          color: '#F59E0B', // Amber
          bg: '#FFFBEB',
          icon: 'clock-outline',
          label: 'In Progress',
          statusIcon: 'clock-fast',
        };
      case 'FAILED':
      case 'REJECTED':
        return {
          color: '#EF4444', // Red
          bg: '#FEF2F2',
          icon: 'alert-circle-outline',
          label: 'Declined',
          statusIcon: 'close-circle',
        };
      default:
        return {
          color: '#6B7280', // Gray
          bg: '#F9FAFB',
          icon: 'help-circle-outline',
          label: status,
          statusIcon: 'help-circle',
        };
    }
  };

  const formatReason = (reason: string) => {
    if (!reason) return 'Cancellation Refund';
    return reason.replace(/_/g, ' ');
  };

  const renderRefundItem = ({ item }: { item: RefundRequest }) => {
    const config = getStatusConfig(item.status);
    const amountVal = parseToDecimal(item.amount as any);
    const formattedDate = item.order?.createdAt
      ? new Date(item.order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        })
      : '';

    return (
      <TouchableOpacity
        style={styles.refundCard}
        onPress={() => setSelectedRefund(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusIconWrapper, { backgroundColor: config.bg }]}>
              <MaterialIcon name={config.statusIcon} size={20} color={config.color} />
            </View>
            <View>
              <Text style={styles.orderLabel}>Order Refund</Text>
              <Text style={styles.orderNumber}>#{item.order?.orderNumber || item.orderId}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusPillText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.cardInfoCol}>
            <Text style={styles.infoLabel}>Reason</Text>
            <Text style={styles.reasonText} numberOfLines={1}>
              {formatReason(item.reason)}
            </Text>
          </View>
          <View style={styles.cardAmountCol}>
            <Text style={styles.infoLabel}>Refunded</Text>
            <Text style={styles.amountText}>₹{amountVal.toFixed(2)}</Text>
          </View>
        </View>

        {item.description ? (
          <View style={styles.cardFooter}>
            <MaterialIcon name="comment-text-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.footerNoteText} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Premium Gradient Header Card */}
      <LinearGradient
        colors={[COLORS.primary, '#6D28D9', '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
          <View style={styles.headerBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-ios" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Refund Balance</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Quick Metrics display */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Processed Back to Source</Text>
              <Text style={styles.metricValue}>₹{stats.totalRefunded.toFixed(2)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>In-flight Refunds</Text>
              <View style={styles.activeRequestsRow}>
                <Text style={styles.metricValue}>{stats.pendingCount}</Text>
                {stats.pendingCount > 0 && <View style={styles.activeDot} />}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Body List Container */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Verifying updates...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <MaterialIcon name="wifi-strength-alert-outline" size={54} color="#EF4444" />
            <Text style={styles.errorText}>Unable to sync refund history</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry Sync</Text>
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
                <View style={styles.emptyIconCircle}>
                  <MaterialIcon name="cash-multiple" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyText}>No refunds yet</Text>
                <Text style={styles.emptySubText}>
                  Records will appear here once order cancellations are verified and processed.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Transaction Bottom Sheet */}
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
            <View style={styles.bottomSheetIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refund Receipt</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRefund(null)}>
                <Icon name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {selectedRefund ? (
              <View style={styles.modalBody}>
                {/* Big Amount Card */}
                <View style={styles.receiptAmountCard}>
                  <Text style={styles.receiptAmountLabel}>Refund Amount</Text>
                  <Text style={styles.receiptAmountVal}>
                    ₹{parseToDecimal(selectedRefund.amount as any).toFixed(2)}
                  </Text>
                  <View style={[
                    styles.receiptStatusBadge, 
                    { backgroundColor: `${getStatusConfig(selectedRefund.status).color}12` }
                  ]}>
                    <Text style={[styles.receiptStatusText, { color: getStatusConfig(selectedRefund.status).color }]}>
                      {getStatusConfig(selectedRefund.status).label.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Details Breakdown */}
                <View style={styles.receiptDetails}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Refund ID</Text>
                    <Text style={styles.receiptRowValue}>{selectedRefund.id}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Order Number</Text>
                    <Text style={[styles.receiptRowValue, styles.boldReceiptVal]}>
                      #{selectedRefund.order?.orderNumber || selectedRefund.orderId}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Reason</Text>
                    <Text style={styles.receiptRowValue}>{formatReason(selectedRefund.reason)}</Text>
                  </View>

                  {selectedRefund.order?.createdAt ? (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptRowLabel}>Order Date</Text>
                      <Text style={styles.receiptRowValue}>
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
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptRowLabel}>Processed At</Text>
                      <Text style={styles.receiptRowValue}>
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
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptRowLabel}>Gateway Transaction ID</Text>
                      <Text style={[styles.receiptRowValue, styles.monoValue]}>
                        {selectedRefund.referenceId}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Remarks/Notes */}
                {selectedRefund.description ? (
                  <View style={styles.modalRemarksBlock}>
                    <Text style={styles.remarksBlockTitle}>Remarks from Admin</Text>
                    <Text style={styles.remarksBlockContent}>{selectedRefund.description}</Text>
                  </View>
                ) : null}

                {/* Dismiss Button */}
                <TouchableOpacity 
                  style={[styles.dismissBtnLarge, { backgroundColor: getStatusConfig(selectedRefund.status).color }]} 
                  onPress={() => setSelectedRefund(null)}
                >
                  <Text style={styles.dismissBtnText}>Close Receipt</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF', // Sleek background color matching the purple palette
  },
  gradientHeader: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
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
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 12,
  },
  activeRequestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  listContainer: {
    flex: 1,
    marginTop: -12,
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
    color: '#7C3AED',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1E1B4B',
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  refundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3E8FF', // Subtle purple border to look aesthetic
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3E8FF',
    marginVertical: 4,
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    padding: 12,
    borderRadius: 16,
  },
  cardInfoCol: {
    flex: 1,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  cardAmountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C3AED',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFFBEB', // Subtle warning note background
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  footerNoteText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissTrigger: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    maxHeight: screenHeight * 0.85,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  bottomSheetIndicator: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E9D5FF',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#FAF5FF',
  },
  modalBody: {
    gap: 22,
  },
  receiptAmountCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  receiptAmountLabel: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  receiptAmountVal: {
    fontSize: 34,
    fontWeight: '900',
    color: '#7C3AED',
    marginBottom: 10,
  },
  receiptStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  receiptStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  receiptDetails: {
    gap: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  receiptRowLabel: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  receiptRowValue: {
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '700',
  },
  boldReceiptVal: {
    fontWeight: '900',
  },
  monoValue: {
    fontFamily: 'monospace',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  modalRemarksBlock: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 4,
  },
  remarksBlockTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remarksBlockContent: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '600',
  },
  dismissBtnLarge: {
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});

export default RefundScreen;
