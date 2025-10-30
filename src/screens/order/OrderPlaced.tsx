import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme'; // make sure this file exports your color palette
import { AppNavigation } from '../../types/type';

const OrderConfirmationScreen = ({navigation}: AppNavigation) => {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={[
                styles.container,
                { paddingTop: insets.top, backgroundColor: COLORS.background },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('BottomTab')}>
                    <Icon name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmation</Text>
                <View style={styles.headerButton} />
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                {/* Success Icon */}
                <View style={styles.successOuter}>
                    <View style={styles.successMid}>
                        <View style={styles.successInner}>
                            <Icon name="done" size={48} color={COLORS.white} />
                        </View>
                    </View>
                </View>

                {/* Headline */}
                <Text style={styles.title}>Order Placed Successfully!</Text>

                {/* Body Text */}
                <Text style={styles.subtitle}>
                    Thank you for your order! Your food is on its way.
                </Text>

                {/* Meta Info */}
                <Text style={styles.meta}>Order ID: #ORD-58934</Text>

                {/* Estimated Delivery */}
                <View style={styles.etaContainer}>
                    <Icon name="timer" size={22} color={COLORS.primary} />
                    <Text style={styles.etaText}>Estimated arrival: 25-35 mins</Text>
                </View>
            </View>

            {/* CTA Buttons */}
            <View style={[styles.ctaContainer, { paddingBottom: insets.bottom || 16 }]}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("OrderTracking")}>
                    <Text style={styles.primaryButtonText}>Track Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("OrderDetails")}>
                    <Text style={styles.secondaryButtonText}>View Order Details</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OrderConfirmationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        justifyContent: 'space-between',
    },
    headerButton: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    main: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    successOuter: {
        height: 128,
        width: 128,
        borderRadius: 999,
        backgroundColor: 'rgba(34,197,94,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successMid: {
        height: 96,
        width: 96,
        borderRadius: 999,
        backgroundColor: 'rgba(34,197,94,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successInner: {
        height: 80,
        width: 80,
        borderRadius: 999,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.muted,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 4,
    },
    meta: {
        color: '#888',
        fontSize: 13,
        marginBottom: 24,
        textAlign: 'center',
    },
    etaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary + '20',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    etaText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
    ctaContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: COLORS.primary + '50',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 16,
    },
});