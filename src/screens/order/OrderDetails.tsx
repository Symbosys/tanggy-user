import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigation } from '../../types/type';

const OrderDetailsScreen = ({navigation}: AppNavigation) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Icon name="help-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Order Summary */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.restaurantName}>Pizza Palace</Text>
                            <Text style={styles.orderId}>Order ID: #123456789</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Preparing</Text>
                        </View>
                    </View>

                    <Text style={styles.eta}>Estimated Arrival: 15-20 mins</Text>

                    {/* Progress bar */}
                    <View style={{ marginTop: 12 }}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.progressLabel}>Placed</Text>
                            <Text style={styles.progressLabel}>Preparing</Text>
                            <Text style={styles.progressLabel}>On the Way</Text>
                            <Text style={styles.progressLabel}>Delivered</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: '45%' }]} />
                        </View>
                    </View>
                </View>

                {/* Delivery Partner */}
                <Text style={styles.sectionTitle}>Delivery Partner</Text>
                <View style={styles.cardRow}>
                    <Image
                        source={{
                            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAcZnWp-I_cfQlf1AOoHjNy1jsA7r27A_p9J7ArKXJvLDDoo3-Lls8GWJStoqUqhPMT4CF-_Gv8WflGB3nGoovyk_2zTIPeMnWDGwD16O_AuJ0QaDxhjFpm45uGH8j0jIzV-iDfbKX2kOy_EvPX6l0le49uK5KBF09MFyiKGeaMXiKrhowl53SEllOa8GTSxJPDSfd7xbV6dXTz6SySwEZToqlP1nZmCB1b7G8hLSmIVzvYNMIZBEC_k-k6IaV0AEE64o8kZuB10TU',
                        }}
                        style={styles.profileImage}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.partnerName}>Ravi Kumar</Text>
                        <Text style={styles.partnerStatus}>On the way to restaurant</Text>
                    </View>
                    <TouchableOpacity style={styles.chatButton}>
                        <Icon name="chat-bubble" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton}>
                        <Icon name="call" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Delivery & Order Details */}
                <View style={styles.card}>
                    <View>
                        <Text style={styles.boldText}>Delivery Address</Text>
                        <Text style={styles.subText}>
                            123, Sunshine Apartments, Willow Creek, Bangalore - 560001
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View>
                        <Text style={styles.boldText}>Your Order</Text>
                        <View style={styles.orderRow}>
                            <Text style={styles.subText}>1 x Margherita Pizza</Text>
                            <Text style={styles.boldText}>₹250</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <Text style={styles.subText}>2 x Coke (500ml)</Text>
                            <Text style={styles.boldText}>₹80</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <Text style={styles.subText}>Subtotal</Text>
                            <Text style={styles.boldText}>₹330</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <Text style={styles.subText}>Taxes & Charges</Text>
                            <Text style={styles.boldText}>₹45</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <Text style={styles.subText}>Delivery Fee</Text>
                            <Text style={styles.boldText}>₹30</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderRow}>
                            <Text style={styles.boldText}>Total Paid</Text>
                            <Text style={styles.boldText}>₹405</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View>
                        <Text style={styles.boldText}>Payment Info</Text>
                        <Text style={styles.subText}>Paid via Visa **** 1234</Text>
                    </View>
                </View>

                {/* Order Timeline */}
                <Text style={styles.sectionTitle}>Order Timeline</Text>
                <View style={styles.card}>
                    {[
                        {
                            icon: 'receipt-long',
                            title: 'Order Placed',
                            desc: 'We have received your order.',
                            time: '10:30 AM',
                            active: true,
                        },
                        {
                            icon: 'restaurant',
                            title: 'Order Confirmed',
                            desc: 'The restaurant has confirmed your order.',
                            time: '10:31 AM',
                        },
                        {
                            icon: 'outdoor-grill',
                            title: 'Preparing your order',
                            desc: 'Your food is being prepared.',
                            time: '10:35 AM',
                        },
                    ].map((item, index) => (
                        <View
                            key={index}
                            style={[styles.timelineItem, !item.active && { opacity: 0.5 }]}
                        >
                            <View style={styles.timelineIcon}>
                                <Icon name={item.icon} size={18} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.timelineTitle}>{item.title}</Text>
                                <Text style={styles.timelineDesc}>{item.desc}</Text>
                            </View>
                            <Text style={styles.timelineTime}>{item.time}</Text>
                        </View>
                    ))}
                </View>

                {/* Help Section */}
                <View style={styles.helpCard}>
                    <Text style={styles.helpTitle}>Need Help with your order?</Text>
                    <TouchableOpacity style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Chat with Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>Report an Issue</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.outlineBarButton}>
                    <Icon name="map" size={20} color={COLORS.primary} />
                    <Text style={styles.outlineButtonText}>Track Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBarButton} onPress={() => navigation.navigate("ChatWithDelivery")} >
                    <Icon name="chat-bubble" size={20} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Chat with Partner</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        backgroundColor: COLORS.white,
    },
    headerButton: {
        width: 40,
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    orderId: {
        fontSize: 13,
        color: COLORS.muted,
    },
    statusBadge: {
        backgroundColor: '#F5B7B1',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    eta: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: 8,
        color: COLORS.textPrimary,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 11,
        color: COLORS.muted,
    },
    progressBarBackground: {
        backgroundColor: '#ddd',
        height: 6,
        borderRadius: 4,
        marginTop: 6,
    },
    progressBarFill: {
        backgroundColor: COLORS.primary,
        height: 6,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 16,
        marginTop: 16,
        color: COLORS.textPrimary,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 12,
        elevation: 2,
    },
    profileImage: {
        width: 56,
        height: 56,
        borderRadius: 999,
        marginRight: 12,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    partnerStatus: {
        fontSize: 13,
        color: COLORS.muted,
    },
    chatButton: {
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    callButton: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boldText: {
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subText: {
        color: COLORS.muted,
        fontSize: 13,
        marginTop: 4,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 6,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    timelineTitle: {
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    timelineDesc: {
        fontSize: 13,
        color: COLORS.muted,
    },
    timelineTime: {
        fontSize: 12,
        color: COLORS.muted,
    },
    helpCard: {
        backgroundColor: '#FADBD8',
        borderRadius: 16,
        margin: 16,
        padding: 16,
        alignItems: 'center',
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: COLORS.textPrimary,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        width: '100%',
    },
    outlineButtonText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderTopWidth: 0.5,
        borderColor: '#ccc',
        backgroundColor: COLORS.white,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        paddingBottom: 50,
    },
    outlineBarButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 10,
        marginRight: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    primaryBarButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 10,
        marginLeft: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
});

