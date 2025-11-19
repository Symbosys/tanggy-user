import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme'; // As requested
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppNavigation } from '../../types/type';

// Note: The HTML uses `bg-white` and `dark:bg-black/20` for cards.
// I am using `COLORS.white` as per the light theme.
const cardBackground = COLORS.white;
const lightBorder = '#E5E7EB'; // Approximation for gray-200, or use COLORS.muted

const TrackOrder = ({ navigation }: AppNavigation) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    How do I track my order?
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* FAQ Answer Content */}
                <View style={styles.contentContainer}>
                    <Text style={styles.paragraph}>
                        Tracking your order is easy! Once your order is confirmed and the
                        restaurant starts preparing it, a live tracking map will become
                        available. You can follow these steps to see exactly where your
                        delivery is:
                    </Text>

                    {/* Manual Ordered List */}
                    <View style={styles.list}>
                        <View style={styles.listItem}>
                            <Text style={styles.listNumber}>1.</Text>
                            <Text style={styles.listText}>
                                Navigate to the 'Orders' tab from the bottom menu.
                            </Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listNumber}>2.</Text>
                            <Text style={styles.listText}>
                                Tap on your current, active order card.
                            </Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listNumber}>3.</Text>
                            <Text style={styles.listText}>
                                You will see a map with the real-time location of your delivery
                                driver.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.paragraph}>
                        You'll also receive push notifications for key updates, such as
                        'Order picked up' and 'Arriving soon'.
                    </Text>

                    {/* Media Embed */}
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHJQWBotz4wV3bBvw0rzYgYjKSLEssz8RFJiNDJLj0kJlwxubeBp_XTyqgjFrp2z-g5XJ5FL2IWb_n6DFBTu7uEUcDPH4y8xzFtclE96KJysSzCunFdiBA7ifPUS-mnDK77fQivMrX6eAkF-r9IT_7aeZiyb0gh9YUeGiOvT5trKaCqdRsFhpclZjcAhplYsDgLq679HeuE63kjB9SZYNBKxJgQWjkLIkmKfiYC3Uxy6agKtcekJUZrRMsLpbGB5XFLvPQTtyK0dUL' }}
                            // A more appropriate placeholder
                            // source={{ uri: 'https://via.placeholder.com/1600x900' }}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                </View>

                {/* Related FAQs Section */}
                <View style={styles.relatedContainer}>
                    <Text style={styles.relatedTitle}>Related Questions</Text>

                    <TouchableOpacity style={styles.relatedItem}>
                        <Text style={styles.relatedItemText} numberOfLines={1}>
                            What if my order is late?
                        </Text>
                        <View style={styles.relatedItemIcon}>
                            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.relatedItem}>
                        <Text style={styles.relatedItemText} numberOfLines={1}>
                            Can I change my delivery address?
                        </Text>
                        <View style={styles.relatedItemIcon}>
                            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Contact Support Prompt (Sticky Footer) */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <Text style={styles.footerText}>Still need help?</Text>
                    <TouchableOpacity style={styles.chatButton}>
                        <Text style={styles.chatButtonText}>Chat with Us</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16, // p-4
        paddingBottom: 8, // pb-2
        borderBottomWidth: 1,
        borderBottomColor: lightBorder,
        backgroundColor: COLORS.background, // sticky
    },
    headerIconContainer: {
        width: 40, // size-10
        height: 40, // size-10
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18, // text-lg
        fontWeight: '800', // Per user request
        color: COLORS.textPrimary,
        paddingRight: 40, // pr-10 (to balance the icon)
    },
    scrollContent: {
        paddingBottom: 120, // To make sure content doesn't hide behind footer
    },
    contentContainer: {
        padding: 16, // p-4
        gap: 16, // space-y-4
    },
    paragraph: {
        fontSize: 16, // text-base
        fontWeight: '400', // font-normal
        lineHeight: 24, // leading-relaxed
        color: COLORS.textSecondary,
    },
    list: {
        marginLeft: 16, // list-inside approximation
        gap: 8, // space-y-2
    },
    listItem: {
        flexDirection: 'row',
    },
    listNumber: {
        fontSize: 16,
        color: COLORS.textSecondary,
        width: 20,
    },
    listText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    imageContainer: {
        paddingVertical: 12, // py-3
        width: '100%',
    },
    image: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 32, // rounded-lg (from user's config)
        backgroundColor: COLORS.muted, // placeholder bg
    },
    dividerContainer: {
        paddingHorizontal: 16, // px-4
        paddingVertical: 8, // py-2
    },
    divider: {
        borderTopWidth: 1,
        borderColor: lightBorder,
    },
    relatedContainer: {
        padding: 16, // p-4
        gap: 12, // space-y-3
    },
    relatedTitle: {
        color: COLORS.textPrimary,
        fontSize: 18, // text-lg
        fontWeight: '800', // font-bold per user request
    },
    relatedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: cardBackground,
        borderRadius: 16, // rounded
        padding: 12, // p-3
        minHeight: 56, // min-h-14
        gap: 16, // gap-4
    },
    relatedItemText: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 16, // text-base
        fontWeight: '400', // font-normal
    },
    relatedItemIcon: {
        width: 28, // size-7
        height: 28, // size-7
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        padding: 16, // p-4
        borderTopWidth: 1,
        borderTopColor: lightBorder,
        marginTop: 24, // mt-6
    },
    footerContent: {
        alignItems: 'center',
        gap: 12, // gap-3
    },
    footerText: {
        fontSize: 14, // text-sm
        fontWeight: '500', // font-medium
        color: COLORS.textSecondary,
    },
    chatButton: {
        width: '100%',
        paddingHorizontal: 24, // px-6
        paddingVertical: 12, // py-3
        backgroundColor: COLORS.primary,
        borderRadius: 9999, // rounded-full
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatButtonText: {
        color: COLORS.white,
        fontSize: 16, // Matches HTML (default button font size)
        fontWeight: '800', // font-bold per user request
    },
});

export default TrackOrder;