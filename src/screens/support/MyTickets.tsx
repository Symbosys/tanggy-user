import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import { useGetAllTickets, SupportTicket } from '../../api/hooks/useSupportTickets';

const MyTicketsScreen: React.FC<AppNavigation> = ({ navigation }) => {
    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetAllTickets();

    const tickets = useMemo(() => data?.pages.flatMap(page => page.tickets) || [], [data]);

    console.log("tickets", tickets)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return '#3B82F6';
            case 'IN_PROGRESS':
                return '#F59E0B';
            case 'AWAITING_RESPONSE':
                return '#8B5CF6';
            case 'RESOLVED':
                return '#10B981';
            case 'CLOSED':
                return '#6B7280';
            default:
                return '#9CA3AF';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'fiber-new';
            case 'IN_PROGRESS':
                return 'hourglass-empty';
            case 'AWAITING_RESPONSE':
                return 'question-answer';
            case 'RESOLVED':
                return 'check-circle';
            case 'CLOSED':
                return 'lock';
            default:
                return 'info';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays}d ago`;
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    };

    const renderTicketCard = ({ item: ticket }: { item: SupportTicket }) => (
        <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket.id })}
            activeOpacity={0.7}
        >
            <View style={styles.ticketHeader}>
                <View style={styles.ticketNumberContainer}>
                    <Icon name="confirmation-number" size={16} color={COLORS.primary} />
                    <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                    <Icon name={getStatusIcon(ticket.status)} size={14} color={getStatusColor(ticket.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <Text style={styles.ticketSubject} numberOfLines={2}>
                {ticket.subject}
            </Text>

            <Text style={styles.ticketDescription} numberOfLines={2}>
                {ticket.description}
            </Text>

            <View style={styles.ticketFooter}>
                <View style={styles.categoryContainer}>
                    <Icon name="label-outline" size={14} color={COLORS.muted} />
                    <Text style={styles.categoryText}>
                        {ticket.category.replace(/_/g, ' ')}
                    </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(ticket.createdAt)}</Text>
            </View>

            {ticket.attachments && (
                <View style={styles.attachmentIndicator}>
                    <Icon name="attach-file" size={14} color={COLORS.muted} />
                    <Text style={styles.attachmentText}>Has attachment</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Icon name="support-agent" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Support Tickets</Text>
            <Text style={styles.emptyText}>
                You haven't created any support tickets yet.
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('ReportIssue')}
            >
                <Icon name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Ticket</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Tickets</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your tickets...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Tickets</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Icon name="error-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Failed to load tickets</Text>
                    <Text style={styles.errorText}>Please check your connection and try again</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Tickets</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ReportIssue')}
                    style={styles.addButton}
                >
                    <Icon name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={tickets}
                renderItem={renderTicketCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.scrollContent, tickets.length === 0 && styles.emptyContent]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && !isFetchingNextPage}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
            />
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
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.muted,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
    ticketsList: {
        gap: 12,
    },
    ticketCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ticketNumber: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 22,
    },
    ticketDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
        marginBottom: 12,
        lineHeight: 20,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
        textTransform: 'capitalize',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.muted,
    },
    attachmentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    attachmentText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.muted,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 20,
    },
    createButton: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    createButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
    footerLoader: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 16,
    },
    emptyContent: {
        flexGrow: 1,
    },
});

export default MyTicketsScreen;
