import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

const MyWalletScreen = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Credits', 'Debits'];

    const transactions = [
        {
            id: 1,
            type: 'credit',
            icon: 'call-received',
            title: 'Order Refund',
            subtitle: 'Order #ORD-2025-1023',
            amount: '+ ₹ 150.00',
            amountColor: '#1DB954',
            date: 'Oct 28, 2023',
        },
        {
            id: 2,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1022',
            amount: '- ₹ 450.50',
            amountColor: '#ff9fa3',
            date: 'Oct 27, 2023',
        },
        {
            id: 3,
            type: 'credit',
            icon: 'add-card',
            title: 'Amount Added',
            subtitle: 'via UPI',
            amount: '+ ₹ 500.00',
            amountColor: '#1DB954',
            date: 'Oct 26, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
        {
            id: 4,
            type: 'debit',
            icon: 'call-made',
            title: 'Paid for Order',
            subtitle: 'Order #ORD-2025-1021',
            amount: '- ₹ 75.00',
            amountColor: '#ff9fa3',
            date: 'Oct 25, 2023',
        },
    ];

    const handleFilterPress = (filter: string) => {
        setSelectedFilter(filter);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Icon name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Wallet</Text>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Icon name="account-balance-wallet" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balance}>₹ 2,560.75</Text>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <LinearGradient
                            colors={[COLORS.accent, COLORS.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addMoneyButton}
                        >
                            <TouchableOpacity style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Add Money</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        <TouchableOpacity style={styles.withdrawButton}>
                            <Text style={styles.withdrawText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Sticky Section: History Header + Filters */}
                <View style={styles.stickySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Transaction History</Text>
                    </View>

                    {/* Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filtersContainer}
                        contentContainerStyle={styles.filtersContent}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === filter && styles.activeFilterButton,
                                ]}
                                onPress={() => handleFilterPress(filter)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter && styles.activeFilterText,
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Transactions */}
                <View style={styles.transactionsContainer}>
                    {transactions.map((transaction) => (
                        <View
                            key={transaction.id}
                            style={[
                                styles.transactionCard,
                                {
                                    backgroundColor: transaction.type === 'credit' ? '#f0fff4' : '#fef2f2',
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.transactionIcon,
                                    {
                                        backgroundColor:
                                            transaction.type === 'credit' ? '#d1fae5' : '#fecaca',
                                    },
                                ]}
                            >
                                <Icon
                                    name={transaction.icon as any}
                                    size={24}
                                    color={transaction.type === 'credit' ? '#10b981' : '#ef4444'}
                                />
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
                            </View>
                            <View style={styles.transactionAmountContainer}>
                                <Text style={[styles.transactionAmount, { color: transaction.amountColor }]}>
                                    {transaction.amount}
                                </Text>
                                <Text style={styles.transactionDate}>{transaction.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        gap: 16,
        paddingHorizontal: 24,
    },
    addMoneyButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.015,
    },
    withdrawButton: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(135, 25, 198, 0.5)',
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    withdrawText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 0.015,
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
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    filtersContent: {
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        minWidth: 88,
    },
    activeFilterButton: {
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    activeFilterText: {
        color: COLORS.primary,
    },
    transactionsContainer: {
        marginTop: 12,
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionDetails: {
        flex: 1,
        marginLeft: 16,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    transactionSubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        marginTop: 2,
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: '800',
    },
    transactionDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
});

export default MyWalletScreen;