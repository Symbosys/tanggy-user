import { useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOrderDetails, useOrders } from '../../api/hooks/useOrder';
import {
    useInitSupportChatSession,
    useResolveSupportChatSession,
    useSendSupportChatMessage,
    useSupportChatHistory,
} from '../../api/hooks/useSupportChat';
import { COLORS } from '../../theme/theme';
import { Order, OrderStatus } from '../../types/order.type';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';

// --- Support Option Interfaces ---
interface SubOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    solutionText: string;
    actionType?: 
        | 'cancel_allowed' 
        | 'cancel_restricted' 
        | 'item_picker' 
        | 'claim_expired_30min' 
        | 'nudge_driver' 
        | 'payment_status' 
        | 'general_info';
}

interface PrimaryCategory {
    id: string;
    title: string;
    icon: string;
    badge?: string;
    description: string;
    subOptions: SubOption[];
}

// --- Chat Message Interface ---
interface UIChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text?: string;
    timestamp: string;
    cardType?: string;
    data?: any;
}

const AISupportAssistantScreen = ({ navigation }: AppNavigation) => {
    const route = useRoute<any>();
    const { orderId, orderNumber } = route?.params || {};

    // --- Dynamic API Hooks Integration ---
    const { data: singleOrder, isLoading: isLoadingSingle } = useOrderDetails({
        id: orderId ? orderId.toString() : undefined,
    });

    // Fallback: fetch latest orders if no specific order route param provided
    const { data: ordersData, isLoading: isLoadingOrders } = useOrders({ page: 1, limit: 1 });

    const activeOrder: Order | undefined = singleOrder || ordersData?.orders?.[0];
    const isLoadingOrder = (orderId || orderNumber) ? isLoadingSingle : isLoadingOrders;

    const resolvedOrderId = activeOrder?.id ? activeOrder.id.toString() : undefined;

    // --- Database Chat Session Hooks ---
    const initChatMutation = useInitSupportChatSession();
    const sendChatMutation = useSendSupportChatMessage();
    const resolveChatMutation = useResolveSupportChatSession();
    const { data: dbChatSession, isLoading: isLoadingChat } = useSupportChatHistory(resolvedOrderId);

    // Local state
    const [messageInput, setMessageInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PrimaryCategory | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Initialize DB Chat Session on mount if needed
    useEffect(() => {
        if (resolvedOrderId && !dbChatSession && !initChatMutation.isPending) {
            initChatMutation.mutate({ orderId: resolvedOrderId });
        }
    }, [resolvedOrderId]);

    const getCurrentTime = (dateStr?: string) => {
        const d = dateStr ? new Date(dateStr) : new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Escalation Counter synced directly from PostgreSQL Database
    const escalationAttempts = dbChatSession?.escalationCount || 0;

    // --- Business Rules Evaluation Engine ---
    const isVendorPending = useMemo(() => {
        if (!activeOrder) return false;
        return activeOrder.status === OrderStatus.PLACED || activeOrder.status === OrderStatus.VENDOR_PENDING;
    }, [activeOrder]);

    const isVendorAccepted = useMemo(() => {
        if (!activeOrder) return false;
        return [
            OrderStatus.VENDOR_ACCEPTED,
            OrderStatus.PREPARING,
            OrderStatus.READY_FOR_PICKUP,
            OrderStatus.DELIVERY_PENDING,
            OrderStatus.OUT_FOR_DELIVERY,
        ].includes(activeOrder.status);
    }, [activeOrder]);

    const isDelivered = useMemo(() => activeOrder?.status === OrderStatus.DELIVERED, [activeOrder]);
    const isCancelled = useMemo(() => activeOrder?.status === OrderStatus.CANCELLED, [activeOrder]);

    // Calculate delivery elapsed time in minutes
    const deliveredTimeAgoMinutes = useMemo(() => {
        if (!isDelivered || !activeOrder) return 0;
        const deliveredAt = activeOrder.timestamps?.deliveredAt || activeOrder.updatedAt;
        if (!deliveredAt) return 0;
        const diffMs = Date.now() - new Date(deliveredAt).getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }, [isDelivered, activeOrder]);

    const isPost30MinDelivered = useMemo(() => isDelivered && deliveredTimeAgoMinutes > 30, [isDelivered, deliveredTimeAgoMinutes]);
    const vendorName = activeOrder?.orderVendorAssignments?.vendor?.shopName || 'Minta Gourmet Partner';

    const orderTotalAmount = useMemo(() => {
        if (!activeOrder) return '0.00';
        const amt = activeOrder.subtotal ?? activeOrder.paidAmount ?? activeOrder.itemTotal ?? 0;
        return parseToDecimal(amt).toFixed(2);
    }, [activeOrder]);

    // --- Dynamic Support Categories Generator ---
    const supportCategories: PrimaryCategory[] = useMemo(() => {
        if (!activeOrder) return [];
        const categories: PrimaryCategory[] = [];

        if (isVendorPending) {
            categories.push({
                id: 'cancel_order',
                title: 'Cancel Order (Free)',
                icon: 'cancel',
                badge: '100% Refund',
                description: 'Order not accepted by vendor yet. Cancel for full refund.',
                subOptions: [
                    {
                        id: 'cancel_allowed_opt',
                        title: 'Cancel my active order now',
                        description: 'Instant cancellation & full wallet reversal',
                        icon: 'highlight-off',
                        actionType: 'cancel_allowed',
                        solutionText: 'Your order has not been accepted by the kitchen yet. You are eligible for free instant cancellation.',
                    },
                ],
            });
        } else if (isVendorAccepted) {
            categories.push({
                id: 'cancel_order',
                title: 'Cancel Order & Refund Rules',
                icon: 'cancel-schedule-send',
                badge: 'Restricted',
                description: 'Cancellation rules for in-prep orders',
                subOptions: [
                    {
                        id: 'cancel_restricted_opt',
                        title: 'I want to cancel my active order',
                        description: 'Kitchen is currently preparing food',
                        icon: 'no-food',
                        actionType: 'cancel_restricted',
                        solutionText: `Your order has already been accepted by ${vendorName} and food preparation is underway. Cancellation at this stage is restricted as ingredients cannot be reused.`,
                    },
                    {
                        id: 'cancellation_policy_info',
                        title: 'How does cancellation fee work?',
                        description: 'Understand kitchen preparation policies',
                        icon: 'info-outline',
                        actionType: 'general_info',
                        solutionText: 'Free cancellation is available before restaurant accepts the order. Once cooking begins, cancellation charges equal to the order total apply to compensate food wastage.',
                    },
                ],
            });
        }

        if (isDelivered) {
            if (isPost30MinDelivered) {
                categories.push({
                    id: 'missing_wrong_item',
                    title: 'Items Missing or Wrong Item',
                    icon: 'shopping-bag',
                    badge: 'Claim Expired',
                    description: `Delivered ${deliveredTimeAgoMinutes} mins ago (30 min cutoff exceeded)`,
                    subOptions: [
                        {
                            id: 'missing_item_expired',
                            title: 'Report missing or wrong item',
                            description: 'Support claim window has closed',
                            icon: 'timer-off',
                            actionType: 'claim_expired_30min',
                            solutionText: `As per Minta Fresh Quality Policy, claims regarding food items must be reported within 30 minutes of delivery. This order was delivered ${deliveredTimeAgoMinutes} minutes ago, so automated refund claims have expired for this order.`,
                        },
                    ],
                });
            } else {
                categories.push({
                    id: 'missing_wrong_item',
                    title: 'Items Missing or Wrong Item',
                    icon: 'shopping-bag',
                    badge: 'Eligible (within 30m)',
                    description: `Select missing items for instant credit`,
                    subOptions: [
                        {
                            id: 'missing_item_active',
                            title: 'An item is missing from my bag',
                            description: 'Select missing items from your order',
                            icon: 'remove-shopping-cart',
                            actionType: 'item_picker',
                            solutionText: 'Please select the missing item(s) below. We will immediately issue a refund credit for your selected items.',
                        },
                    ],
                });
            }
        }

        if (isDelivered) {
            categories.push({
                id: 'food_quality_qty',
                title: 'Food Quality & Packaging',
                icon: 'restaurant',
                description: 'Spilled packaging, cold dish, or quality issues',
                subOptions: [
                    {
                        id: 'spilled_damaged',
                        title: 'Food packaging spilled or damaged',
                        description: isPost30MinDelivered ? 'Report packaging concern' : 'Claim instant resolution coupon',
                        icon: 'cleaning-services',
                        actionType: isPost30MinDelivered ? 'claim_expired_30min' : 'general_info',
                        solutionText: isPost30MinDelivered
                            ? `This order was delivered ${deliveredTimeAgoMinutes} minutes ago. Quality reports must be submitted within 30 minutes of delivery for instant verification.`
                            : `We take food handling seriously! Your quality feedback has been shared with ${vendorName} quality supervisor.`,
                    },
                ],
            });
        }

        if (isVendorAccepted) {
            categories.push({
                id: 'delivery_delay',
                title: 'Order Delayed & Live Driver',
                icon: 'delivery-dining',
                badge: 'Live Status',
                description: 'Track delivery partner movement',
                subOptions: [
                    {
                        id: 'driver_not_moving',
                        title: 'Delivery executive is delayed or not moving',
                        description: 'Check live status or send prompt',
                        icon: 'wrong-location',
                        actionType: 'nudge_driver',
                        solutionText: `Your delivery partner is navigating to your address. Order Status: ${activeOrder.status}.`,
                    },
                ],
            });
        }

        categories.push({
            id: 'payment_refunds',
            title: 'Payment & Wallet Refunds',
            icon: 'account-balance-wallet',
            description: 'Check refund timeline and transaction status',
            subOptions: [
                {
                    id: 'refund_status',
                    title: 'Where is my refund for this order?',
                    description: 'Check payment reversal timelines',
                    icon: 'currency-rupee',
                    actionType: 'payment_status',
                    solutionText: 'UPI/Wallet refunds are processed instantly within 2 hours. Credit/Debit card refunds take 3-5 business days depending on your bank.',
                },
            ],
        });

        return categories;
    }, [activeOrder, isVendorPending, isVendorAccepted, isDelivered, isPost30MinDelivered, deliveredTimeAgoMinutes, vendorName]);

    // Map database messages to UI format
    const uiMessages: UIChatMessage[] = useMemo(() => {
        if (!dbChatSession?.messages || dbChatSession.messages.length === 0) {
            if (!activeOrder) return [];
            const orderNum = activeOrder.orderNumber ? activeOrder.orderNumber.split('-').pop() : activeOrder.id.toString();
            return [
                {
                    id: 'msg_welcome',
                    sender: 'ai',
                    text: `Hello! 👋 I'm **MintaBot**, your 24/7 AI Support Assistant.\n\nI am connected directly to your order **#${orderNum}**. How can I help you today?`,
                    timestamp: getCurrentTime(),
                },
                {
                    id: 'msg_order_context',
                    sender: 'ai',
                    text: `Order Summary: **${activeOrder.items?.length || 0} Items** • Total: **₹${orderTotalAmount}**\nStatus: **${activeOrder.status}**`,
                    timestamp: getCurrentTime(),
                    cardType: 'category_grid',
                },
            ];
        }

        return dbChatSession.messages.map(m => ({
            id: m.id,
            sender: m.senderType === 'USER' ? 'user' : 'ai',
            text: m.messageText,
            timestamp: getCurrentTime(m.createdAt),
            cardType: m.cardType || undefined,
            data: m.cardData,
        }));
    }, [dbChatSession, activeOrder, orderTotalAmount]);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
    }, [uiMessages, isTyping]);

    // Animated Typing Indicator Component
    const TypingIndicator = () => {
        const dot1 = useRef(new Animated.Value(0)).current;
        const dot2 = useRef(new Animated.Value(0)).current;
        const dot3 = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const createAnimation = (animatedValue: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(animatedValue, {
                            toValue: -8,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedValue, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            Animated.parallel([
                createAnimation(dot1, 100),
                createAnimation(dot2, 300),
                createAnimation(dot3, 500),
            ]).start();
        }, []);

        return (
            <View style={styles.typingContainer}>
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
                <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
            </View>
        );
    };

    // Send Message to DB Endpoint
    const sendMessageToDb = (text: string, cardType?: string, cardData?: any) => {
        if (!dbChatSession?.sessionId) return;
        setIsTyping(true);
        sendChatMutation.mutate(
            {
                sessionId: dbChatSession.sessionId,
                messageText: text,
                cardType,
                cardData,
            },
            {
                onSettled: () => setIsTyping(false),
            }
        );
    };

    // Category Select Handler
    const handleCategorySelect = (category: PrimaryCategory) => {
        setSelectedCategory(category);
        sendMessageToDb(category.title, 'sub_options', category.subOptions);
    };

    // Sub-option Select Handler
    const handleSubOptionSelect = (subOption: SubOption) => {
        sendMessageToDb(subOption.title, subOption.actionType, subOption);
    };

    // Unresolved Issue / Attempt Increment Handler
    const handleUnresolvedIssue = () => {
        sendMessageToDb("No, this didn't resolve my issue 😞");
    };

    // Execute Call Customer Support
    const handleCallCustomerSupport = () => {
        const phoneNumber = 'tel:18001239999';
        Linking.canOpenURL(phoneNumber)
            .then(supported => {
                if (supported) {
                    Linking.openURL(phoneNumber);
                } else {
                    Alert.alert('Customer Support', 'Helpline Number: +91 1800-123-9999');
                }
            })
            .catch(() => {
                Alert.alert('Customer Support', 'Helpline: +91 1800-123-9999');
            });
    };

    // Confirm Cancellation Handler
    const handleConfirmCancelOrder = () => {
        sendMessageToDb("Confirm Order Cancellation", "cancel_allowed_confirm");
    };

    // Free Text Send Handler
    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        const text = messageInput.trim();
        setMessageInput('');
        sendMessageToDb(text);
    };

    // Toggle Item Selection
    const toggleItemSelect = (itemId: string) => {
        setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    // Submit Missing Items Claim
    const handleSubmitMissingItems = () => {
        const selectedCount = Object.values(selectedItems).filter(Boolean).length;
        if (selectedCount === 0) {
            Alert.alert('Select Item', 'Please select at least one item to proceed.');
            return;
        }

        sendMessageToDb(
            `Claiming missing items refund for ${selectedCount} items`,
            'item_picker',
            { selectedCount, selectedItems }
        );
    };

    // Reset Session Handler
    const handleResetChat = () => {
        if (dbChatSession?.sessionId) {
            resolveChatMutation.mutate({ sessionId: dbChatSession.sessionId });
        }
        if (resolvedOrderId) {
            initChatMutation.mutate({ orderId: resolvedOrderId });
        }
    };

    if (isLoadingOrder || isLoadingChat) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={['top']}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Connecting to Support Database...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['#8719C6', '#b58ff0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientTextWrapper}>
                        <Text style={styles.headerTitle}>Minta Support AI 🤖</Text>
                    </LinearGradient>

                    <TouchableOpacity onPress={handleResetChat} style={styles.headerButton}>
                        <Icon name="refresh" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Subtitle & DB Synced Attempt Counter */}
                <View style={styles.headerSubtitleRow}>
                    <Text style={styles.headerSubtitle}>
                        Database Synced • Persistent Chat Session
                    </Text>
                    {escalationAttempts > 0 && (
                        <View style={styles.attemptBadge}>
                            <Text style={styles.attemptBadgeText}>
                                Attempts: {escalationAttempts}/5
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerDivider} />
            </View>

            {/* Chat Area */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}>

                {/* Dynamic Order Context Banner */}
                {activeOrder && (
                    <View style={styles.activeOrderBanner}>
                        <View style={styles.orderBannerHeader}>
                            <Icon name="restaurant" size={20} color={COLORS.primary} />
                            <Text style={styles.orderBannerTitle}>{vendorName}</Text>
                            <View style={[
                                styles.orderStatusChip,
                                isDelivered && { backgroundColor: '#059669' },
                                isCancelled && { backgroundColor: '#DC2626' },
                            ]}>
                                <Text style={styles.orderStatusText}>{activeOrder.status}</Text>
                            </View>
                        </View>

                        <Text style={styles.orderBannerDetails}>
                            Order #{activeOrder.orderNumber ? activeOrder.orderNumber.split('-').pop() : activeOrder.id.toString()} • {activeOrder.items?.length || 0} Items • ₹{orderTotalAmount}
                        </Text>

                        {isDelivered && (
                            <Text style={styles.deliveryTimestampText}>
                                Delivered {deliveredTimeAgoMinutes} mins ago {isPost30MinDelivered ? '• (30m Cutoff Exceeded)' : '• (Eligible for 30m claims)'}
                            </Text>
                        )}
                    </View>
                )}

                {/* Messages List from PostgreSQL */}
                {uiMessages.map((msg, index) => (
                    <View key={msg.id || index}>
                        {/* Text Message Bubble */}
                        <View style={msg.sender === 'user' ? styles.messageRowUser : styles.messageRow}>
                            {msg.sender === 'ai' && (
                                <Image
                                    source={{
                                        uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80',
                                    }}
                                    style={styles.avatar}
                                />
                            )}

                            <View style={msg.sender === 'user' ? styles.messageContainerUser : styles.messageContainer}>
                                {msg.sender === 'ai' ? (
                                    <LinearGradient
                                        colors={['#ffffff', '#f8f4ff']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.aiBubble}>
                                        <Text style={styles.aiMessageText}>{msg.text}</Text>
                                        <Text style={styles.timestampText}>{msg.timestamp}</Text>
                                    </LinearGradient>
                                ) : (
                                    <LinearGradient
                                        colors={['#8719C6', '#b58ff0']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.userBubble}>
                                        <Text style={styles.userMessageText}>{msg.text}</Text>
                                        <Icon name="done-all" size={16} color={COLORS.white} />
                                    </LinearGradient>
                                )}
                            </View>
                        </View>

                        {/* Interactive Cards */}

                        {/* 1. Category Grid */}
                        {msg.cardType === 'category_grid' && (
                            <View style={styles.cardContainer}>
                                <Text style={styles.sectionHeaderTitle}>Choose how we can help:</Text>
                                <View style={styles.categoriesGrid}>
                                    {supportCategories.map(cat => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={styles.categoryCard}
                                            onPress={() => handleCategorySelect(cat)}
                                            activeOpacity={0.7}>
                                            <View style={styles.categoryCardTop}>
                                                <View style={styles.categoryIconBox}>
                                                    <Icon name={cat.icon} size={22} color={COLORS.primary} />
                                                </View>
                                                {cat.badge && (
                                                    <View style={styles.categoryBadge}>
                                                        <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                                            <Text style={styles.categoryDesc} numberOfLines={2}>
                                                {cat.description}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* 2. Sub Options List */}
                        {msg.cardType === 'sub_options' && msg.data && (
                            <View style={styles.cardContainer}>
                                {msg.data.map((sub: SubOption) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={styles.subOptionCard}
                                        onPress={() => handleSubOptionSelect(sub)}
                                        activeOpacity={0.7}>
                                        <View style={styles.subOptionLeft}>
                                            <Icon name={sub.icon} size={22} color={COLORS.primary} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.subOptionTitle}>{sub.title}</Text>
                                                <Text style={styles.subOptionDesc}>{sub.description}</Text>
                                            </View>
                                        </View>
                                        <Icon name="chevron-right" size={22} color="#AAA" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* 3. Free Cancellation Confirm Card */}
                        {msg.cardType === 'cancel_allowed_confirm' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.allowedCancelCard}>
                                    <View style={styles.warningCardHeader}>
                                        <Icon name="check-circle" size={24} color={COLORS.success} />
                                        <Text style={[styles.warningTitle, { color: COLORS.success }]}>Free Cancellation Available</Text>
                                    </View>
                                    <Text style={styles.warningBody}>
                                        The restaurant has not accepted your order yet. You can cancel now for a 100% full refund credited instantly to your wallet.
                                    </Text>
                                    <TouchableOpacity style={styles.confirmCancelBtn} onPress={handleConfirmCancelOrder}>
                                        <Text style={styles.confirmCancelBtnText}>Cancel Order & Claim Full Refund</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 4. Restricted Cancellation Card */}
                        {msg.cardType === 'cancel_policy' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.policyWarningCard}>
                                    <View style={styles.warningCardHeader}>
                                        <Icon name="warning" size={24} color={COLORS.warning} />
                                        <Text style={styles.warningTitle}>Cancellation Restricted</Text>
                                    </View>
                                    <Text style={styles.warningBody}>
                                        Food is currently being prepared by the restaurant chef. Cancellations after acceptance incur a 100% fee to avoid food wastage.
                                    </Text>
                                    <View style={styles.resolutionButtonsColumn}>
                                        <TouchableOpacity
                                            style={styles.actionOutlineBtn}
                                            onPress={() => Alert.alert('Address Note', 'Driver notified of delivery instruction!')}>
                                            <Icon name="edit-location" size={18} color={COLORS.primary} />
                                            <Text style={styles.actionOutlineText}>Add Delivery Instruction</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.unresolvedBtn} onPress={handleUnresolvedIssue}>
                                            <Text style={styles.unresolvedBtnText}>Still need help / Didn't solve issue</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 5. 30-Minute Expiry Card */}
                        {msg.cardType === 'expired_warning' && (
                            <View style={styles.cardContainer}>
                                <View style={styles.expiredCard}>
                                    <View style={styles.warningCardHeader}>
                                        <Icon name="timer-off" size={24} color="#D32F2F" />
                                        <Text style={[styles.warningTitle, { color: '#D32F2F' }]}>Support Claim Expired (30m Rule)</Text>
                                    </View>
                                    <Text style={styles.warningBody}>
                                        This order was delivered {deliveredTimeAgoMinutes} minutes ago. In accordance with Minta Fresh quality guidelines, item claims must be made within 30 minutes of delivery.
                                    </Text>
                                    <TouchableOpacity style={styles.unresolvedBtn} onPress={handleUnresolvedIssue}>
                                        <Text style={styles.unresolvedBtnText}>Didn't solve issue / I still need help</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 6. Item Picker Card */}
                        {msg.cardType === 'item_picker' && activeOrder?.items && (
                            <View style={styles.cardContainer}>
                                <View style={styles.itemPickerCard}>
                                    <Text style={styles.itemPickerTitle}>Select missing/damaged items:</Text>
                                    {activeOrder.items.map((item: any, idx: number) => {
                                        const itemId = item.id ? item.id.toString() : `item_${idx}`;
                                        const itemName = item.product?.name || `Item #${idx + 1}`;
                                        const itemPrice = parseToDecimal(item.totalPrice || item.price || 0).toFixed(2);
                                        return (
                                            <TouchableOpacity
                                                key={itemId}
                                                style={styles.itemPickerRow}
                                                onPress={() => toggleItemSelect(itemId)}>
                                                <Icon
                                                    name={selectedItems[itemId] ? 'check-box' : 'check-box-outline-blank'}
                                                    size={22}
                                                    color={selectedItems[itemId] ? COLORS.primary : '#999'}
                                                />
                                                <Text style={styles.itemPickerName}>{itemName} (Qty: {item.quantity})</Text>
                                                <Text style={styles.itemPickerPrice}>₹{itemPrice}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}

                                    <TouchableOpacity style={styles.submitItemsBtn} onPress={handleSubmitMissingItems}>
                                        <Text style={styles.submitItemsBtnText}>Submit Claim For Selected Items</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 7. Call Customer Support Card (Unlocked on 5th Attempt in DB) */}
                        {msg.cardType === 'call_support' && (
                            <View style={styles.cardContainer}>
                                <LinearGradient
                                    colors={['#8719C6', '#5B1186']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.callSupportCard}>
                                    <View style={styles.callCardHeader}>
                                        <View style={styles.callIconCircle}>
                                            <Icon name="headset-mic" size={28} color="#8719C6" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.callCardTitle}>Direct Customer Support Unlocked</Text>
                                            <Text style={styles.callCardSub}>
                                                You tried {escalationAttempts} times. Phone helpline is ready.
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.callInfoBox}>
                                        <Icon name="phone-in-talk" size={20} color="#FFD700" />
                                        <Text style={styles.callInfoText}>Helpline: +91 1800-123-9999 (24/7 Priority Agent)</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.makeCallBtn}
                                        onPress={handleCallCustomerSupport}
                                        activeOpacity={0.8}>
                                        <Icon name="call" size={22} color={COLORS.white} />
                                        <Text style={styles.makeCallBtnText}>Call Customer Support Now</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                    <View style={styles.messageRow}>
                        <Image
                            source={{
                                uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80',
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.messageContainer}>
                            <View style={styles.aiBubbleTyping}>
                                <TypingIndicator />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Input Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <View style={styles.footer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.quickRepliesContainer}
                        contentContainerStyle={styles.quickRepliesContent}>
                        {supportCategories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.quickReplyChip}
                                onPress={() => handleCategorySelect(cat)}>
                                <Text style={styles.quickReplyText}>{cat.title}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.quickReplyChip} onPress={handleUnresolvedIssue}>
                            <Text style={styles.quickReplyText}>📞 Connect Agent</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.inputBar}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type your issue or question..."
                                placeholderTextColor="#888"
                                value={messageInput}
                                onChangeText={setMessageInput}
                                onSubmitEditing={handleSendMessage}
                            />
                        </View>

                        <LinearGradient
                            colors={['#8719C6', '#b58ff0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendButton}>
                            <TouchableOpacity style={styles.sendButtonInner} onPress={handleSendMessage}>
                                <Icon name="send" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    header: {
        backgroundColor: COLORS.white,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    gradientTextWrapper: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    headerSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    attemptBadge: {
        backgroundColor: '#FFE0B2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    attemptBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#E65100',
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    },
    activeOrderBanner: {
        backgroundColor: '#F3E5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    orderBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    orderBannerTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
    },
    orderStatusChip: {
        backgroundColor: '#8719C6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    orderStatusText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    orderBannerDetails: {
        fontSize: 12,
        fontWeight: '500',
        color: '#555',
    },
    deliveryTimestampText: {
        fontSize: 11,
        color: '#7B1FA2',
        fontWeight: '600',
        marginTop: 4,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 14,
    },
    messageRowUser: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 14,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    messageContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    messageContainerUser: {
        flex: 1,
        alignItems: 'flex-end',
    },
    aiBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 14,
        paddingVertical: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
    },
    aiBubbleTyping: {
        borderRadius: 16,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    aiMessageText: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    timestampText: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        borderBottomRightRadius: 0,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        elevation: 2,
    },
    userMessageText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.white,
        lineHeight: 20,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    cardContainer: {
        marginBottom: 16,
        marginLeft: 42,
    },
    sectionHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    categoryCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3E5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#E65100',
    },
    categoryTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    categoryDesc: {
        fontSize: 11,
        color: '#777',
        lineHeight: 14,
    },
    subOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    subOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    subOptionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    subOptionDesc: {
        fontSize: 11,
        color: '#777',
    },
    allowedCancelCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#A5D6A7',
    },
    confirmCancelBtn: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    confirmCancelBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.white,
    },
    policyWarningCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    expiredCard: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    warningCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#F57F17',
    },
    warningBody: {
        fontSize: 12,
        color: '#5D4037',
        lineHeight: 18,
        marginBottom: 12,
    },
    resolutionButtonsColumn: {
        gap: 8,
    },
    actionOutlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionOutlineText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    unresolvedBtn: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    unresolvedBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D32F2F',
        textDecorationLine: 'underline',
    },
    itemPickerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    itemPickerTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    itemPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemPickerName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    itemPickerPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    submitItemsBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    submitItemsBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.white,
    },
    callSupportCard: {
        borderRadius: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#8719C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    callCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    callIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.white,
    },
    callCardSub: {
        fontSize: 11,
        color: '#E0BBE4',
        marginTop: 2,
    },
    callInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 14,
    },
    callInfoText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.white,
    },
    makeCallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 25,
    },
    makeCallBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },
    footer: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 6,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    quickRepliesContainer: {
        marginBottom: 6,
    },
    quickRepliesContent: {
        gap: 8,
        paddingVertical: 4,
    },
    quickReplyChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F3E5F5',
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    quickReplyText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 22,
        paddingHorizontal: 14,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    sendButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AISupportAssistantScreen;