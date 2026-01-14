import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import { useGetTicketById, useAddMessage, useCloseTicket } from '../../api/hooks/useSupportTickets';
import { launchImageLibrary, Asset, MediaType } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const TicketDetailsScreen: React.FC<AppNavigation> = ({ navigation, route }) => {
    const ticketId = route?.params?.ticketId;
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<Asset | null>(null);

    const { data: ticket, isLoading, error, refetch } = useGetTicketById(ticketId, !!ticketId);
    const { mutate: addMessage, isPending: isSendingMessage } = useAddMessage();
    const { mutate: closeTicket, isPending: isClosing } = useCloseTicket();

    const getStatusColor = (status?: string) => {
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

    const handleAddImage = () => {
        const options = {
            mediaType: 'photo' as MediaType,
            selectionLimit: 1,
            maxWidth: 1024,
            maxHeight: 1024,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel || response.errorMessage) return;
            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                if (asset.fileSize && asset.fileSize > 200 * 1024) {
                    Alert.alert('File Too Large', 'Image size must be less than 200KB');
                    return;
                }
                setSelectedImage(asset);
            }
        });
    };

    const handleSendMessage = () => {
        if (!message.trim()) {
            Alert.alert('Missing Message', 'Please enter a message');
            return;
        }

        const messageData: any = {
            message: message.trim(),
        };

        if (selectedImage && selectedImage.uri) {
            messageData.image = {
                uri: selectedImage.uri,
                type: selectedImage.type || 'image/jpeg',
                name: selectedImage.fileName || `message_image_${Date.now()}.jpg`,
            };
        }

        addMessage(
            { ticketId, messageData },
            {
                onSuccess: () => {
                    setMessage('');
                    setSelectedImage(null);
                    refetch();
                },
            }
        );
    };

    const handleCloseTicket = () => {
        closeTicket(ticketId, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ticket Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !ticket) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ticket Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Icon name="error-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Failed to load ticket</Text>
                </View>
            </SafeAreaView>
        );
    }

    const canInteract = ticket.status !== 'CLOSED';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ticket Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Ticket Info Card */}
                <View style={styles.ticketInfoCard}>
                    <View style={styles.ticketHeaderRow}>
                        <View style={styles.ticketNumberContainer}>
                            <Icon name="confirmation-number" size={16} color={COLORS.primary} />
                            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                                {ticket.status.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.ticketSubject}>{ticket.subject}</Text>

                    <View style={styles.ticketMetaRow}>
                        <View style={styles.metaItem}>
                            <Icon name="label-outline" size={14} color={COLORS.muted} />
                            <Text style={styles.metaText}>{ticket.category.replace(/_/g, ' ')}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="schedule" size={14} color={COLORS.muted} />
                            <Text style={styles.metaText}>
                                {new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.descriptionLabel}>Description</Text>
                    <Text style={styles.description}>{ticket.description}</Text>

                    {ticket.attachments && (
                        <View style={styles.attachmentContainer}>
                            <Image
                                source={{ uri: ticket.attachments.url }}
                                style={styles.attachmentImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    {canInteract && (
                        <TouchableOpacity
                            style={styles.closeTicketButton}
                            onPress={handleCloseTicket}
                            disabled={isClosing}
                        >
                            {isClosing ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <>
                                    <Icon name="check-circle-outline" size={18} color="#EF4444" />
                                    <Text style={styles.closeTicketText}>Close Ticket</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Message Section */}
                {canInteract && (
                    <View style={styles.messageSection}>
                        <Text style={styles.sectionTitle}>Send a message</Text>
                        <View style={styles.messageInputContainer}>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Type your message..."
                                placeholderTextColor={COLORS.muted}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={3}
                                editable={!isSendingMessage}
                            />

                            {selectedImage && (
                                <View style={styles.selectedImageContainer}>
                                    <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => setSelectedImage(null)}
                                    >
                                        <Icon name="close" size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.messageActions}>
                                <TouchableOpacity
                                    style={styles.attachButton}
                                    onPress={handleAddImage}
                                    disabled={isSendingMessage || !!selectedImage}
                                >
                                    <Icon name="attach-file" size={20} color={COLORS.primary} />
                                    <Text style={styles.attachButtonText}>Attach Image</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!message.trim() || isSendingMessage) && styles.sendButtonDisabled,
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={!message.trim() || isSendingMessage}
                                >
                                    {isSendingMessage ? (
                                        <ActivityIndicator size="small" color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Icon name="send" size={18} color={COLORS.white} />
                                            <Text style={styles.sendButtonText}>Send</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {!canInteract && (
                    <View style={styles.closedNotice}>
                        <Icon name="lock" size={20} color="#6B7280" />
                        <Text style={styles.closedNoticeText}>This ticket is closed</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
        padding: 16,
        paddingBottom: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    ticketInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    ticketHeaderRow: {
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ticketSubject: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
        lineHeight: 24,
    },
    ticketMetaRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.muted,
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.muted,
        lineHeight: 20,
    },
    attachmentContainer: {
        marginTop: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    attachmentImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    closeTicketButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    closeTicketText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#EF4444',
    },
    messageSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    messageInputContainer: {
        gap: 12,
    },
    messageInput: {
        minHeight: 100,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textPrimary,
        textAlignVertical: 'top',
    },
    selectedImageContainer: {
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageActions: {
        flexDirection: 'row',
        gap: 12,
    },
    attachButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    attachButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    sendButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.white,
    },
    closedNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    closedNoticeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default TicketDetailsScreen;
