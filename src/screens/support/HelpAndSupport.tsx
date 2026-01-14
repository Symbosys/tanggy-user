import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import TopicDetailsModal from '../../components/modal/BrowseTopic';
import { AppNavigation } from '../../types/type';

const { width: screenWidth } = Dimensions.get('window');

interface FaqItem {
    question: string;
    answer: string;
}

interface QuickHelpItem {
    icon: string;
    title: string;
    navigation: keyof AppNavigation['navigate'];
}

const HelpSupportScreen = ({ navigation }: AppNavigation) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const quickHelpItems: readonly QuickHelpItem[] = [
        { icon: 'history', title: 'Order History', navigation: 'MyOrders' },
        { icon: 'location-on', title: 'Track Order', navigation: 'HowToTrackOrder' },
        { icon: 'confirmation-number', title: 'My Tickets', navigation: 'MyTickets' },
        { icon: 'report-problem', title: 'Report Issue', navigation: 'ReportIssue' },
    ];

    const browseTopics = [
        { icon: 'delivery-dining', title: 'Delivery & Orders' },
        { icon: 'account-balance-wallet', title: 'Payment & Wallet' },
        { icon: 'person-outline', title: 'Account & Settings' },
        { icon: 'local-offer', title: 'Offers & Vouchers' },
    ];

    const filteredQuickItems = useMemo(() => {
        if (!searchQuery.trim()) return quickHelpItems;
        return quickHelpItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const filteredTopics = useMemo(() => {
        if (!searchQuery.trim()) return browseTopics;
        return browseTopics.filter(topic =>
            topic.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const getFaqs = (topic: string): FaqItem[] => {
        const faqs: { [key: string]: FaqItem[] } = {
            'Delivery & Orders': [
                { question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days within the continental US.' },
                { question: 'What is the delivery fee?', answer: 'Delivery fee is $5 for orders under $50. Free shipping on orders over $50.' },
                { question: 'Can I track my order?', answer: 'Yes, use the Track My Order feature above to monitor your shipment in real-time.' },
            ],
            'Payment & Wallet': [
                { question: 'What payment methods are accepted?', answer: 'We accept Visa, Mastercard, American Express, PayPal, and Apple Pay.' },
                { question: 'How do I get a refund?', answer: 'Refunds are processed within 7 business days to your original payment method.' },
                { question: 'Is my payment information secure?', answer: 'Yes, all transactions are encrypted with SSL and PCI compliant.' },
            ],
            'Account & Settings': [
                { question: 'How do I change my password?', answer: 'Go to Account Settings, select Security, and follow the reset instructions.' },
                { question: 'How do I update my address?', answer: 'Navigate to Profile in My Account and edit your shipping address details.' },
                { question: 'How can I view my order history?', answer: 'Access Orders section in My Account to see all past purchases and statuses.' },
            ],
            'Offers & Vouchers': [
                { question: 'How do I apply a voucher code?', answer: 'Enter the code in the Promotions field at checkout and click Apply.' },
                { question: 'Where can I find current promotions?', answer: 'Check the Promotions tab on the home screen or subscribe to our newsletter.' },
                { question: 'Can vouchers be combined?', answer: 'Yes, up to 2 vouchers can be stacked on eligible orders.' },
            ],
        };
        return faqs[topic] || [];
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Simple Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Icon name="search" size={20} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for help"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                {filteredQuickItems.length > 0 && (
                    <View style={styles.quickSection}>
                        {filteredQuickItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickItem}
                                onPress={() => navigation.navigate(item.navigation)}
                                activeOpacity={0.6}
                            >
                                <View style={styles.quickIconBox}>
                                    <Icon name={item.icon} size={24} color={COLORS.primary} />
                                </View>
                                <Text style={styles.quickText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Browse Topics */}
                {filteredTopics.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Browse by topic</Text>
                        {filteredTopics.map((topic, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.topicItem}
                                onPress={() => setSelectedTopic(topic.title)}
                                activeOpacity={0.6}
                            >
                                <View style={styles.topicLeft}>
                                    <Icon name={topic.icon} size={22} color={COLORS.textPrimary} />
                                    <Text style={styles.topicText}>{topic.title}</Text>
                                </View>
                                <Icon name="chevron-right" size={22} color="#CCC" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Empty Search State */}
                {searchQuery.length > 0 && filteredQuickItems.length === 0 && filteredTopics.length === 0 && (
                    <View style={styles.emptyState}>
                        <Icon name="search-off" size={48} color="#CCC" />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
                    </View>
                )}

                {/* Contact Section */}
                {!searchQuery && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Get in touch</Text>

                        <TouchableOpacity style={styles.contactCard} activeOpacity={0.6}>
                            <View style={styles.contactLeft}>
                                <View style={styles.contactIcon}>
                                    <Icon name="chat-bubble-outline" size={22} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactTitle}>Chat with us</Text>
                                    <Text style={styles.contactSubtitle}>Avg. response time: 2 mins</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={22} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactCard}
                            onPress={() => navigation.navigate("AiAssistant")}
                            activeOpacity={0.6}
                        >
                            <View style={styles.contactLeft}>
                                <View style={styles.contactIcon}>
                                    <Icon name="smart-toy" size={22} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactTitle}>AI Help</Text>
                                    <Text style={styles.contactSubtitle}>Instant answers, 24/7</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={22} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} activeOpacity={0.6}>
                            <View style={styles.contactLeft}>
                                <View style={styles.contactIcon}>
                                    <Icon name="phone" size={22} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactTitle}>Call us</Text>
                                    <Text style={styles.contactSubtitle}>Mon-Sat, 9 AM - 9 PM</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={22} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} activeOpacity={0.6}>
                            <View style={styles.contactLeft}>
                                <View style={styles.contactIcon}>
                                    <Icon name="email" size={22} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.contactTitle}>Email us</Text>
                                    <Text style={styles.contactSubtitle}>We'll reply within 24 hrs</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={22} color="#CCC" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Modal for Topic Details */}
            <Modal
                visible={!!selectedTopic}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedTopic(null)}
            >
                <TopicDetailsModal
                    topic={selectedTopic || ''}
                    faqs={getFaqs(selectedTopic || '')}
                    onClose={() => setSelectedTopic(null)}
                />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    quickSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    quickItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    quickIconBox: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    section: {
        paddingTop: 20,
        paddingBottom: 8,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    topicItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
    },
    topicLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    topicText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: '#999',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
        textAlign: 'center',
    },
});

export default HelpSupportScreen;