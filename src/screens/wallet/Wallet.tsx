import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUserWalletTransactions } from '../../api/hooks/useWallet';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');

const MyWalletScreen: React.FC<any> = ({ navigation }) => {
  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useUserWalletTransactions({
    page: 1,
    limit: 50,
  });

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  const balance = parseToDecimal(walletData?.balance).toFixed(2);
  const rawTransactions = walletData?.transactions || [];

  const transactions = rawTransactions.filter((t: any) => {
    const isCredit = t.type === 'CREDIT' || t.type === 'REFUND';
    if (filterType === 'CREDIT') return isCredit;
    if (filterType === 'DEBIT') return !isCredit;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tanggy Wallet</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetch()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="refresh" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Digital Wallet Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletCard}
          >
            {/* Ambient Graphic Watermark Accents */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.cardHeader}>
              <View style={styles.brandRow}>
                <View style={styles.walletIconCircle}>
                  <Icon
                    name="account-balance-wallet"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.brandText}>Tanggy Pay</Text>
              </View>

              <View style={styles.secureBadge}>
                <Icon name="shield" size={13} color={COLORS.white} />
                <Text style={styles.secureText}>100% Secure</Text>
              </View>
            </View>

            <View style={styles.balanceBlock}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.perkPill}>
                <Icon name="bolt" size={14} color={COLORS.highlight} />
                <Text style={styles.perkText}>Instant 1-Click Checkout</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Benefits Row */}
        <View style={styles.benefitsRow}>
          {[
            {
              icon: 'flash-on',
              label: 'Fast Refund',
              sub: 'Direct to wallet',
            },
            {
              icon: 'verified-user',
              label: 'Zero Fee',
              sub: 'No hidden charges',
            },
            {
              icon: 'lock',
              label: 'Encrypted',
              sub: 'Bank-grade safety',
            },
          ].map((b, i) => (
            <View key={i} style={styles.benefitCard}>
              <View style={styles.benefitIconWrap}>
                <Icon name={b.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.benefitTitle}>{b.label}</Text>
              <Text style={styles.benefitSub}>{b.sub}</Text>
            </View>
          ))}
        </View>

        {/* Transactions Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{transactions.length}</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'CREDIT', 'DEBIT'] as const).map((type) => {
            const isActive = filterType === type;
            const label =
              type === 'ALL'
                ? 'All'
                : type === 'CREDIT'
                ? 'Credits (+)'
                : 'Debits (-)';
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  isActive && styles.activeFilterChip,
                ]}
                onPress={() => setFilterType(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.activeFilterChipText,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.mutedText}>Loading transactions...</Text>
            </View>
          ) : isError ? (
            <View style={styles.centerContainer}>
              <View style={styles.errorCircle}>
                <Icon name="error-outline" size={36} color={COLORS.error} />
              </View>
              <Text style={styles.errorText}>
                Failed to load wallet transactions
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length > 0 ? (
            transactions.map((transaction: any) => {
              const isCredit =
                transaction.type === 'CREDIT' ||
                transaction.type === 'REFUND';
              const iconName = isCredit ? 'south-west' : 'north-east';
              const iconColor = isCredit ? COLORS.success : COLORS.error;
              const iconBg = isCredit
                ? COLORS.secondary
                : COLORS.primaryLight;
              const amountSign = isCredit ? '+' : '-';
              const amountColor = isCredit ? COLORS.success : COLORS.textPrimary;

              const title =
                transaction.description ||
                `${transaction.type} Transaction`;
              const subtitle = transaction.orderId
                ? `Order #${transaction.orderId}`
                : transaction.referenceId
                ? `Ref: ${transaction.referenceId}`
                : 'Wallet';

              const formattedDate = new Date(
                transaction.createdAt
              ).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTransaction(transaction)}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: iconBg },
                    ]}
                  >
                    <Icon name={iconName} size={18} color={iconColor} />
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <View style={styles.subRow}>
                      <Text style={styles.transactionSubtitle}>
                        {subtitle}
                      </Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.transactionDate}>
                        {formattedDate}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: amountColor },
                      ]}
                    >
                      {amountSign}₹
                      {parseToDecimal(transaction.amount).toFixed(0)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            transaction.status === 'SUCCESS'
                              ? COLORS.secondary
                              : COLORS.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              transaction.status === 'SUCCESS'
                                ? COLORS.success
                                : COLORS.error,
                          },
                        ]}
                      >
                        {transaction.status || 'SUCCESS'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Icon
                  name="receipt-long"
                  size={42}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySub}>
                Your wallet activity, orders, and refunds will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        visible={selectedTransaction !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedTransaction(null)}
                style={styles.modalCloseIcon}
              >
                <Icon name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTransaction &&
              (() => {
                const isCredit =
                  selectedTransaction.type === 'CREDIT' ||
                  selectedTransaction.type === 'REFUND';
                const amountSign = isCredit ? '+' : '-';
                const amountColor = isCredit
                  ? COLORS.success
                  : COLORS.textPrimary;
                const formattedDate = new Date(
                  selectedTransaction.createdAt
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <View style={styles.modalBody}>
                    <View style={styles.modalAmountBox}>
                      <Text
                        style={[
                          styles.modalAmountText,
                          { color: amountColor },
                        ]}
                      >
                        {amountSign}₹
                        {parseToDecimal(selectedTransaction.amount).toFixed(2)}
                      </Text>
                      <View
                        style={[
                          styles.modalStatusBadge,
                          {
                            backgroundColor:
                              selectedTransaction.status === 'SUCCESS'
                                ? COLORS.secondary
                                : COLORS.primaryLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalStatusText,
                            {
                              color:
                                selectedTransaction.status === 'SUCCESS'
                                  ? COLORS.success
                                  : COLORS.error,
                            },
                          ]}
                        >
                          {selectedTransaction.status || 'SUCCESS'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Transaction ID</Text>
                      <Text style={styles.detailValue} selectable={true}>
                        {selectedTransaction.id}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.type}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.description || 'Wallet Transaction'}
                      </Text>
                    </View>

                    {selectedTransaction.orderId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order ID</Text>
                        <Text style={styles.detailValue}>
                          #{selectedTransaction.orderId}
                        </Text>
                      </View>
                    )}

                    {selectedTransaction.referenceId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reference ID</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.referenceId}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>{formattedDate}</Text>
                    </View>
                  </View>
                );
              })()}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setSelectedTransaction(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // ── Digital Wallet Card ──
  cardWrapper: {
    marginBottom: 16,
  },
  walletCard: {
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  decorCircle1: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    opacity: 0.1,
  },
  decorCircle2: {
    position: 'absolute',
    right: 50,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    opacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  balanceBlock: {
    marginBottom: 16,
    zIndex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  perkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  perkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Benefits ──
  benefitsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  benefitSub: {
    fontSize: 9.5,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Sections & Filters ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterChipText: {
    color: COLORS.white,
  },

  // ── Transactions List ──
  transactionsContainer: {
    flex: 1,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionSubtitle: {
    fontSize: 11.5,
    color: COLORS.muted,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 11,
    color: COLORS.muted,
  },
  transactionDate: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // ── States ──
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 12,
    fontWeight: '600',
  },
  errorCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14.5,
    color: COLORS.muted,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 13.5,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalAmountBox: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalAmountText: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
    marginRight: 12,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  modalDoneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default MyWalletScreen;