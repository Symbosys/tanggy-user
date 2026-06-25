import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { useUserWalletTransactions } from '../../api/hooks/useWallet';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');

const MyWalletScreen: React.FC<any> = ({ navigation }) => {
    const { data: walletData, isLoading, isError, refetch, isFetching } = useUserWalletTransactions({
        page: 1,
        limit: 50,
    });

    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const balance = parseToDecimal(walletData?.balance).toFixed(2);
    const transactions = walletData?.transactions || [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation?.goBack()}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Wallet</Text>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Icon name="account-balance-wallet" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balance}>₹ {balance}</Text>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                    </View>
                </LinearGradient>

                {/* Sticky Section */}
                <View style={styles.stickySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Recent Transaction History</Text>
                    </View>
                </View>

                {/* Transaction Display Logic */}
                <View style={styles.transactionsContainer}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading transactions...</Text>
                        </View>
                    ) : isError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error-outline" size={50} color="#EF4444" />
                            <Text style={styles.errorText}>Failed to load wallet details</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : transactions.length > 0 ? (
                        transactions.map((transaction) => {
                            const isCredit = transaction.type === 'CREDIT' || transaction.type === 'REFUND';
                            const iconName = isCredit ? 'arrow-downward' : 'arrow-upward';
                            const iconColor = isCredit ? '#10B981' : '#EF4444';
                            const iconBgColor = isCredit ? '#D1FAE5' : '#FEE2E2';
                            const amountSign = isCredit ? '+' : '-';
                            const amountColor = isCredit ? '#10B981' : '#EF4444';

                            const title = transaction.description || `${transaction.type} Transaction`;
                            const subtitle = transaction.orderId
                                ? `Order #${transaction.orderId}`
                                : transaction.referenceId
                                ? `Ref: ${transaction.referenceId}`
                                : 'N/A';

                            const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-GB', {
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
                                    <View style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}>
                                        <Icon name={iconName} size={20} color={iconColor} />
                                    </View>
                                    <View style={styles.transactionDetails}>
                                        <Text style={styles.transactionTitle} numberOfLines={1}>
                                            {title}
                                        </Text>
                                        <Text style={styles.transactionSubtitle}>
                                            {subtitle}
                                        </Text>
                                    </View>
                                    <View style={styles.transactionAmountContainer}>
                                        <Text style={[styles.transactionAmount, { color: amountColor }]}>
                                            {amountSign} ₹{parseToDecimal(transaction.amount).toFixed(2)}
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {formattedDate}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        // No Transaction Record Message
                        <View style={styles.emptyState}>
                            <Icon name="history" size={60} color="#CBD5E1" />
                            <Text style={styles.noTransactionText}>No transaction record</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Transaction Detail Modal */}
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
                            <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                                <Icon name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedTransaction && (() => {
                            const isCredit = selectedTransaction.type === 'CREDIT' || selectedTransaction.type === 'REFUND';
                            const amountSign = isCredit ? '+' : '-';
                            const amountColor = isCredit ? '#10B981' : '#EF4444';
                            const formattedDate = new Date(selectedTransaction.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            return (
                                <View style={styles.modalBody}>
                                    <View style={styles.modalAmountContainer}>
                                        <Text style={[styles.modalAmountText, { color: amountColor }]}>
                                            {amountSign} ₹{parseToDecimal(selectedTransaction.amount).toFixed(2)}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: selectedTransaction.status === 'SUCCESS' ? '#D1FAE5' : '#FEE2E2' }]}>
                                            <Text style={[styles.statusText, { color: selectedTransaction.status === 'SUCCESS' ? '#10B981' : '#EF4444' }]}>
                                                {selectedTransaction.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Transaction ID</Text>
                                        <Text style={styles.detailValue} selectable={true}>{selectedTransaction.id}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Type</Text>
                                        <Text style={styles.detailValue}>{selectedTransaction.type}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Description</Text>
                                        <Text style={styles.detailValue}>{selectedTransaction.description || 'N/A'}</Text>
                                    </View>

                                    {selectedTransaction.orderId && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Order ID</Text>
                                            <Text style={styles.detailValue}>{selectedTransaction.orderId}</Text>
                                        </View>
                                    )}

                                    {selectedTransaction.referenceId && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Reference ID</Text>
                                            <Text style={styles.detailValue}>{selectedTransaction.referenceId}</Text>
                                        </View>
                                    )}

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date & Time</Text>
                                        <Text style={styles.detailValue}>{formattedDate}</Text>
                                    </View>
                                </View>
                            );
                        })()}
                        
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedTransaction(null)}>
                            <Text style={styles.modalCloseButtonText}>Done</Text>
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
    scrollContent: {
        paddingBottom: 24,
        flexGrow: 1,
    },
    header: {
        paddingTop: 24,
        paddingBottom: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: -0.015,
    },
    balanceContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    balance: {
        fontSize: 50,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: -0.015,
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    stickySection: {
        backgroundColor: COLORS.white,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#160e1b',
        letterSpacing: -0.015,
    },
    transactionsContainer: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 24,
        flex: 1,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noTransactionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 12,
    },
    loadingContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 12,
        fontWeight: '600',
    },
    errorContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 12,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    transactionSubtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#160e1b',
    },
    modalBody: {
        marginBottom: 24,
    },
    modalAmountContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAmountText: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        marginRight: 16,
    },
    detailValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
        textAlign: 'right',
        flex: 1,
    },
    modalCloseButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default MyWalletScreen;