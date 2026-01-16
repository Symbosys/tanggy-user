import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';

const TrackOrder = ({ navigation }: AppNavigation) => {
    const trackingSteps = [
        {
            icon: 'shopping-bag',
            title: 'Open Orders Tab',
            description: 'Navigate to Orders from the bottom menu',
        },
        {
            icon: 'touch-app',
            title: 'Select Active Order',
            description: 'Tap on your current order card',
        },
        {
            icon: 'map',
            title: 'View Live Map',
            description: 'See real-time location and ETA',
        },
    ];

    const relatedQuestions = [
        'What if my order is late?',
        'Can I change my delivery address?',
        'How do I contact the driver?',
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, '#9B4DCA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Your Order</Text>
                <View style={{ width: 44 }} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Introduction */}
                <View style={styles.introSection}>
                    <View style={styles.introIconWrapper}>
                        <Icon name="my-location" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.introTitle}>Real-time Order Tracking</Text>
                    <Text style={styles.introText}>
                        Track your delivery from preparation to your doorstep with live updates
                    </Text>
                </View>

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    {trackingSteps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={styles.stepLeft}>
                                <View style={styles.stepIconCircle}>
                                    <Icon name={step.icon} size={24} color={COLORS.primary} />
                                </View>
                                {index < trackingSteps.length - 1 && (
                                    <View style={styles.stepLine} />
                                )}
                            </View>
                            <View style={styles.stepContent}>
                                <View style={styles.stepHeader}>
                                    <Text style={styles.stepNumber}>Step {index + 1}</Text>
                                </View>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconWrapper}>
                        <Icon name="notifications-active" size={20} color="#F59E0B" />
                    </View>
                    <Text style={styles.infoText}>
                        You'll receive push notifications at every step of your delivery
                    </Text>
                </View>

                {/* Related Questions */}
                <View style={styles.relatedSection}>
                    <Text style={styles.relatedTitle}>Related Questions</Text>
                    {relatedQuestions.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.relatedItem}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.relatedQuestion}>{question}</Text>
                            <Icon name="chevron-right" size={20} color={COLORS.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.chatButton}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, '#9B4DCA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chatButtonGradient}
                    >
                        <Icon name="chat" size={18} color={COLORS.white} />
                        <Text style={styles.chatButtonText}>Chat with Support</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFBFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    introSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    introIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    stepsContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    stepLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
    stepContent: {
        flex: 1,
        paddingBottom: 24,
    },
    stepHeader: {
        marginBottom: 4,
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 24,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    infoIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        lineHeight: 20,
    },
    relatedSection: {
        paddingHorizontal: 24,
    },
    relatedTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    relatedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    relatedQuestion: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    chatButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    chatButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    chatButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.white,
    },
});

export default TrackOrder;