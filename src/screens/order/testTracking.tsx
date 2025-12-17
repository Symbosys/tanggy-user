import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomSheet from '../../components/ui/BottomSheet';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');
const OrderTrackingScreen = () => {
    const [currentState, setCurrentState] = useState<'preparing' | 'tracking' | 'delivered'>('preparing');
    const [riderLocation, setRiderLocation] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
    });
    const bottomSheetRef = useRef<any>(null);

    // Mock data
    const order = {
        id: '#ORD-9823',
        restaurant: 'Pizza Hut - MG Road',
        location: '123 MG Road, Bangalore',
        items: ['Margherita Pizza x1', 'Garlic Bread x2'],
        total: '₹450',
        payment: 'UPI',
        eta: '14 mins',
        deliveryTime: '7:45 – 8:00 PM',
    };

    const rider = {
        name: 'Ravi Kumar',
        photo: 'https://via.placeholder.com/60x60?text=RV', // Placeholder image
        vehicle: 'Honda Activa - KA 03 AB 4721',
        rating: 4.8,
        deliveries: 320,
    };

    // Map coordinates (mock San Francisco area for demo)
    const restaurantLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
    };
    const userLocation = {
        latitude: 37.7849,
        longitude: -122.4294,
    };

    // Progress steps
    const steps = [
        { id: 1, title: 'Order Confirmed', time: '5 mins ago', icon: 'checkmark-circle' },
        { id: 2, title: 'Restaurant Preparing', time: '2 mins remaining', icon: 'restaurant' },
        { id: 3, title: 'Picked Up', time: '3 mins ago', icon: 'bag-handle' },
        { id: 4, title: 'Out for Delivery', time: 'Now', icon: 'bicycle' },
        { id: 5, title: 'Delivered', time: 'Just now', icon: 'home' },
    ];

    // Determine active step and update times based on state
    const getActiveStep = () => {
        if (currentState === 'preparing') return 2;
        if (currentState === 'tracking') return 4;
        return 5;
    };

    const activeStep = getActiveStep();

    // Status text
    const getStatusText = () => {
        if (currentState === 'preparing') return 'Preparing your order 👨‍🍳';
        if (currentState === 'tracking') return 'Your order is on the way 🚴‍♂️';
        return '';
    };

    // Simulate rider movement in tracking state
    useEffect(() => {
        if (currentState === 'tracking') {
            const interval = setInterval(() => {
                setRiderLocation(prev => ({
                    latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
                    longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
                }));
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [currentState]);

    // Open bottom sheet on mount for preparing/tracking states
    useEffect(() => {
        if (currentState !== 'delivered') {
            bottomSheetRef.current?.open(1); // Start at 50% (index 1 for ['20%', '50%', '80%'])
        }
    }, [currentState]);

    // Polyline coordinates for route
    const routeCoordinates = currentState === 'tracking' ? [
        restaurantLocation,
        riderLocation,
        userLocation,
    ] : [];

    if (currentState === 'delivered') {
        return (
            <View style={styles.container}>
                <View
                    style={[
                        styles.deliveredGradient,
                        { backgroundColor: COLORS.primary }
                    ]}
                >
                    <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle" size={120} color={COLORS.white} />
                        <Text style={styles.successTitle}>Order Delivered Successfully!</Text>
                        <Text style={styles.successSubtitle}>Enjoy your meal 🎉</Text>
                        <TouchableOpacity style={styles.feedbackButton}>
                            <Text style={styles.feedbackButtonText}>Rate Your Experience</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View
                style={[
                    styles.topBar,
                    { backgroundColor: 'rgba(255,255,255,0.8)' }
                ]}
            >
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Track Order</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Live Map Section - Full screen, interactive */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                pointerEvents="box-none" // Ensure touches pass through if needed, but since bottom sheet is absolute, map is full
            >
                {/* Restaurant Marker */}
                <Marker
                    coordinate={restaurantLocation}
                    title="Restaurant"
                    description={order.restaurant}
                    pinColor={currentState === 'preparing' ? COLORS.primary : COLORS.muted}
                >
                    <View style={styles.customMarker}>
                        <Ionicons name="restaurant-outline" size={30} color={COLORS.primary} />
                    </View>
                </Marker>

                {/* User Location Marker */}
                <Marker coordinate={userLocation} title="Your Location" pinColor="green">
                    <View style={styles.customMarker}>
                        <Ionicons name="home-outline" size={30} color="green" />
                    </View>
                </Marker>

                {/* Rider Marker (only in tracking) */}
                {currentState === 'tracking' && (
                    <Marker coordinate={riderLocation} title="Delivery Partner" anchor={{ x: 0.5, y: 1 }}>
                        <View style={styles.riderMarker}>
                            <Ionicons name="bicycle" size={30} color={COLORS.primary} />
                            <View style={styles.pulse} />
                        </View>
                    </Marker>
                )}

                {/* Route Polyline (only in tracking) */}
                {currentState === 'tracking' && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor={COLORS.primary}
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
                    />
                )}
            </MapView>

            {/* ETA Badge */}
            <View style={styles.etaBadge}>
                <Ionicons name="clock-outline" size={16} color={COLORS.white} />
                <Text style={styles.etaText}>Arriving in {order.eta}</Text>
            </View>

            {/* Live Status Bar */}
            <View style={styles.statusBar}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>

            {/* Custom Collapsible Bottom Sheet - Non-modal, absolute positioned */}
            <CustomBottomSheet
                ref={bottomSheetRef}
                snapPoints={['20%', '50%', '80%']}
                initialSnapIndex={1} // Start at 50%
                enablePanDownToClose={false}
                backdropComponent={false} // No backdrop to allow map interaction
                onClose={() => { }} // No close needed
                containerStyle={styles.bottomSheetContainer}
                handleStyle={styles.bottomSheetHandle}
                handleIndicatorStyle={styles.bottomSheetHandleIndicator}
                backdropOpacity={0.5}
                animationDuration={300}
                keyboardBehavior="none"
            >
                <SafeAreaView style={styles.bottomSheetContentContainer}>
                    <ScrollView
                        style={styles.bottomSheetContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {/* Delivery Partner Info */}
                        <View style={styles.partnerSection}>
                            <Image source={{ uri: rider.photo }} style={styles.partnerPhoto} />
                            <View style={styles.partnerDetails}>
                                <Text style={styles.partnerName}>{rider.name}</Text>
                                <Text style={styles.vehicleText}>{rider.vehicle}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#FFD700" />
                                    <Text style={styles.ratingText}>{rider.rating} • {rider.deliveries} deliveries</Text>
                                </View>
                            </View>
                            <View style={styles.partnerActions}>
                                <TouchableOpacity style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
                                    <Ionicons name="call-outline" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionIcon, { backgroundColor: COLORS.accent }]}>
                                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Order Progress Tracker */}
                        <View style={styles.progressSection}>
                            <Text style={styles.sectionTitle}>Order Progress</Text>
                            <View style={styles.progressTracker}>
                                {steps.map((step, index) => {
                                    const isActive = activeStep === step.id;
                                    const isCompleted = activeStep > step.id;
                                    return (
                                        <View key={step.id} style={styles.stepContainer}>
                                            <View
                                                style={[
                                                    styles.stepIcon,
                                                    isCompleted && { backgroundColor: COLORS.primary },
                                                    isActive && { backgroundColor: COLORS.highlight },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={isCompleted ? 'checkmark' : step.icon}
                                                    size={20}
                                                    color={isActive ? COLORS.primary : COLORS.white}
                                                />
                                            </View>
                                            {index < steps.length - 1 && <View style={styles.stepLine} />}
                                            <View style={styles.stepContent}>
                                                <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>
                                                    {step.title}
                                                </Text>
                                                <Text style={styles.stepTime}>{step.time}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Order Details Summary */}
                        <View style={styles.detailsSection}>
                            <Text style={styles.sectionTitle}>Order Details</Text>
                            <Text style={styles.restaurantName}>{order.restaurant}</Text>
                            <Text style={styles.restaurantLocation}>{order.location}</Text>
                            <View style={styles.itemsList}>
                                {order.items.map((item, index) => (
                                    <Text key={index} style={styles.itemText}>- {item}</Text>
                                ))}
                            </View>
                            <View style={styles.orderRow}>
                                <Text style={styles.label}>Total:</Text>
                                <Text style={styles.value}>{order.total}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <Text style={styles.label}>Payment:</Text>
                                <Text style={styles.value}>{order.payment}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <Text style={styles.label}>Order ID:</Text>
                                <Text style={styles.value}>{order.id}</Text>
                            </View>
                            <TouchableOpacity style={styles.linkButton}>
                                <Text style={styles.linkText}>View Invoice</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Additional Actions */}
                        <View style={styles.actionsSection}>
                            <Text style={styles.etaRange}>Estimated Delivery: {order.deliveryTime}</Text>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Chat with Support</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { opacity: currentState === 'preparing' ? 1 : 0.5 }]}
                                disabled={currentState !== 'preparing'}
                                onPress={() => { /* Handle cancel */ }}
                            >
                                <Ionicons name="close-circle-outline" size={20} color={COLORS.highlight} />
                                <Text style={[styles.actionButtonText, { color: currentState === 'preparing' ? COLORS.textPrimary : COLORS.muted }]}>
                                    Cancel Order
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Share Tracking Link</Text>
                            </TouchableOpacity>
                            {/* Demo Button Inside Bottom Sheet */}
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: COLORS.primary, marginTop: 10 }]}
                                onPress={() => {
                                    if (currentState === 'preparing') setCurrentState('tracking');
                                    else if (currentState === 'tracking') setCurrentState('delivered');
                                    else setCurrentState('preparing');
                                }}
                            >
                                <Text style={[styles.actionButtonText, { color: COLORS.white, fontWeight: 'bold' }]}>
                                    Switch to {currentState === 'preparing' ? 'Tracking' : currentState === 'tracking' ? 'Delivered' : 'Preparing'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topBar: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 100,
        borderRadius: 16,
        margin: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontFamily: 'Poppins-Bold', // Assume Poppins is linked
    },
    map: {
        flex: 1,
        width: '100%',
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    riderMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 8,
        elevation: 4,
    },
    pulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
        opacity: 0.5,
    },
    etaBadge: {
        position: 'absolute',
        top: 120,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
    },
    etaText: {
        color: COLORS.white,
        fontSize: 14,
        marginLeft: 4,
        fontFamily: 'Poppins-Medium',
    },
    statusBar: {
        position: 'absolute',
        bottom: 100, // Above bottom sheet
        left: 16,
        right: 16,
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: 'Poppins-Regular',
    },
    bottomSheetContentContainer: {
        flex: 1
    },
    bottomSheetContainer: {
        backgroundColor: COLORS.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    bottomSheetHandle: {
        backgroundColor: COLORS.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    bottomSheetHandleIndicator: {
        backgroundColor: COLORS.muted,
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 16,
    },
    partnerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    partnerPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    partnerDetails: {
        flex: 1,
    },
    partnerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontFamily: 'Poppins-Bold',
        marginBottom: 4,
    },
    vehicleText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: 'Poppins-Regular',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.muted,
        marginLeft: 4,
        fontFamily: 'Poppins-Regular',
    },
    partnerActions: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 16,
        fontFamily: 'Poppins-Bold',
    },
    progressTracker: {
        alignItems: 'flex-start',
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        position: 'relative',
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.muted,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stepLine: {
        position: 'absolute',
        left: 20,
        top: 40,
        width: 2,
        height: 60, // Approximate height to connect to next icon
        backgroundColor: COLORS.muted,
        zIndex: 0,
    },
    stepContent: {
        marginLeft: 16,
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontFamily: 'Poppins-Regular',
        marginBottom: 4,
    },
    activeStepTitle: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
    stepTime: {
        fontSize: 12,
        color: COLORS.muted,
        fontFamily: 'Poppins-Regular',
    },
    detailsSection: {
        marginBottom: 24,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
        fontFamily: 'Poppins-Bold',
    },
    restaurantLocation: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
        fontFamily: 'Poppins-Regular',
    },
    itemsList: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
        fontFamily: 'Poppins-Regular',
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: 'Poppins-Regular',
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontFamily: 'Poppins-Bold',
    },
    linkButton: {
        marginTop: 8,
    },
    linkText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: 'Poppins-Medium',
    },
    actionsSection: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingBottom: 400,
    },
    etaRange: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionButtonText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 12,
        fontFamily: 'Poppins-Regular',
    },
    deliveredGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContainer: {
        alignItems: 'center',
        padding: 40,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
    },
    successSubtitle: {
        fontSize: 16,
        color: COLORS.white,
        marginBottom: 32,
        opacity: 0.9,
        fontFamily: 'Poppins-Regular',
    },
    feedbackButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        elevation: 4,
    },
    feedbackButtonText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
});

export default OrderTrackingScreen;