import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigation } from '../../types/type';
import { launchImageLibrary, Asset, MediaType } from 'react-native-image-picker';
import { useCreateTicket } from '../../api/hooks/useSupportTickets';

const { width: screenWidth } = Dimensions.get('window');

// Map frontend categories to backend enum values
const categoryMapping: { [key: string]: string } = {
    'Order Issue': 'ORDER_ISSUE',
    'Payment Issue': 'PAYMENT_ISSUE',
    'Delivery Issue': 'DELIVERY_ISSUE',
    'Account Issue': 'ACCOUNT_ISSUE',
    'Technical Issue': 'TECHNICAL_ISSUE',
    'Feedback': 'FEEDBACK',
    'Complaint': 'COMPLAINT',
    'Inquiry': 'INQUIRY',
    'App Bug': 'BUG',
    'Other': 'OTHER',
};

const ReportProblemScreen: React.FC<AppNavigation> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [subject, setSubject] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<Asset | null>(null);

    const { mutate: createTicket, isPending } = useCreateTicket();

    const categories: string[] = [
        'Order Issue',
        'Payment Issue',
        'Delivery Issue',
        'Account Issue',
        'Technical Issue',
        'Feedback',
        'Complaint',
        'Inquiry',
        'App Bug',
        'Other',
    ];

    const handleAddMedia = (): void => {
        const options = {
            mediaType: 'photo' as MediaType,
            selectionLimit: 1,
            maxWidth: 1024,
            maxHeight: 1024,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                return;
            }
            if (response.errorMessage) {
                console.error('ImagePicker Error:', response.errorMessage);
                return;
            }
            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                // Check file size (max 200KB)
                if (asset.fileSize && asset.fileSize > 200 * 1024) {
                    Alert.alert('File Too Large', 'Image size must be less than 200KB. Please choose a smaller image.');
                    return;
                }

                setSelectedImage(asset);
            }
        });
    };

    const handleRemoveImage = (): void => {
        setSelectedImage(null);
    };

    const handleSubmit = (): void => {
        // Validation
        if (!description.trim()) {
            Alert.alert('Missing Information', 'Please describe the issue');
            return;
        }

        if (!subject.trim()) {
            Alert.alert('Missing Information', 'Please enter a subject');
            return;
        }

        // Get the backend category value
        const backendCategory = categoryMapping[categories[selectedCategory]];

        // Prepare ticket data
        const ticketData: any = {
            category: backendCategory,
            subject: subject.trim(),
            description: description.trim(),
            priority: 'MEDIUM',
            source: 'MOBILE_APP',
        };

        // Add order ID if provided
        if (orderId.trim()) {
            ticketData.orderId = orderId.trim();
        }

        // Add image if selected
        if (selectedImage && selectedImage.uri) {
            ticketData.image = {
                uri: selectedImage.uri,
                type: selectedImage.type || 'image/jpeg',
                name: selectedImage.fileName || `ticket_image_${Date.now()}.jpg`,
            };
        }

        // Submit ticket
        createTicket(ticketData, {
            onSuccess: () => {
                // Reset form
                setSelectedCategory(0);
                setSubject('');
                setOrderId('');
                setDescription('');
                setSelectedImage(null);

                // Navigate back after a short delay
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            },
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report a Problem</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.body}>
                    {/* Problem Category Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What is the issue related to?</Text>
                        <View style={styles.categoriesContainer}>
                            {categories.map((category: string, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.categoryChip,
                                        index === selectedCategory ? styles.selectedChip : styles.unselectedChip,
                                    ]}
                                    onPress={() => setSelectedCategory(index)}
                                    disabled={isPending}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            index === selectedCategory ? styles.selectedText : styles.unselectedText,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Details Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Subject *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Brief summary of the issue"
                                placeholderTextColor={COLORS.muted}
                                value={subject}
                                onChangeText={setSubject}
                                editable={!isPending}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Order ID (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your Order ID"
                                placeholderTextColor={COLORS.muted}
                                value={orderId}
                                onChangeText={setOrderId}
                                editable={!isPending}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.descriptionGroup]}>
                            <Text style={styles.inputLabel}>Description *</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Please describe the issue in detail..."
                                placeholderTextColor={COLORS.muted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                editable={!isPending}
                            />
                        </View>

                        {selectedImage ? (
                            <View style={styles.mediaContainer}>
                                <View style={styles.previewContainer}>
                                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={handleRemoveImage}
                                        disabled={isPending}
                                    >
                                        <Icon name="close" size={24} color={COLORS.white} />
                                    </TouchableOpacity>
                                    <View style={styles.imageSizeInfo}>
                                        <Text style={styles.imageSizeText}>
                                            {selectedImage.fileSize
                                                ? `${(selectedImage.fileSize / 1024).toFixed(1)} KB`
                                                : 'Unknown size'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.mediaContainer}>
                                <TouchableOpacity
                                    style={styles.addMediaButton}
                                    onPress={handleAddMedia}
                                    disabled={isPending}
                                >
                                    <Icon name="add-photo-alternate" size={24} color={COLORS.muted} />
                                    <Text style={styles.addMediaText}>Add Photo (Max 200KB)</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Icon name="info-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                Your contact information will be automatically attached from your profile
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <LinearGradient
                    colors={isPending ? ['#CCCCCC', '#AAAAAA'] : ['#8719C6', '#b58ff0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                >
                    <TouchableOpacity
                        style={styles.submitTouchable}
                        onPress={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <ActivityIndicator size="small" color={COLORS.white} />
                                <Text style={styles.submitText}>Submitting...</Text>
                            </>
                        ) : (
                            <Text style={styles.submitText}>Submit Report</Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: COLORS.background,
    },
    headerLeft: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginRight: 48,
        letterSpacing: -0.3,
    },
    headerSpacer: {
        width: 48,
        height: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    body: {
        flexGrow: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryChip: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    selectedChip: {
        backgroundColor: COLORS.primary + '32',
        borderColor: COLORS.primary,
    },
    unselectedChip: {
        backgroundColor: COLORS.white,
        borderColor: '#E5E7EB',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    selectedText: {
        color: COLORS.primary,
    },
    unselectedText: {
        color: COLORS.muted,
    },
    inputSection: {
        gap: 16,
        flexDirection: 'column',
    },
    inputGroup: {
        gap: 8,
    },
    descriptionGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    textInput: {
        height: 56,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: COLORS.white,
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textPrimary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    textArea: {
        minHeight: 144,
        textAlignVertical: 'top',
    },
    mediaContainer: {
        marginTop: 16,
    },
    addMediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        backgroundColor: COLORS.white,
    },
    addMediaText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.muted,
    },
    previewContainer: {
        position: 'relative',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageSizeInfo: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    imageSizeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    infoSection: {
        marginTop: 24,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#F8F4FF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    submitContainer: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: COLORS.background,
    },
    submitButton: {
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
});

export default ReportProblemScreen;