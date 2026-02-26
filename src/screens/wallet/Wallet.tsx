import React from 'react';
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

// Define Interface for Type Safety
interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    icon: string;
    title: string;
    subtitle: string;
    amount: string;
    amountColor: string;
    date: string;
}

const MyWalletScreen: React.FC = () => {
    // Transaction history records removed
    const transactions: Transaction[] = [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* Header - Kept exactly as is */}
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
                        <Text style={styles.balance}>₹ 0</Text>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                    </View>
                </LinearGradient>

                {/* Sticky Section - Kept exactly as is */}
                <View style={styles.stickySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Recent Transaction History</Text>
                    </View>
                </View>

                {/* Transaction Display Logic */}
                <View style={styles.transactionsContainer}>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <View key={transaction.id} style={styles.transactionCard}>
                                {/* Existing card UI would go here */}
                            </View>
                        ))
                    ) : (
                        // No Transaction Record Message
                        <View style={styles.emptyState}>
                            <Icon name="history" size={60} color="#CBD5E1" />
                            <Text style={styles.noTransactionText}>No transaction record</Text>
                        </View>
                    )}
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
    // New Styles for the Empty State
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
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
});

export default MyWalletScreen;