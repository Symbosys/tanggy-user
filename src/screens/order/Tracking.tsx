import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    Animated,
    Easing,
    Platform,
    StatusBar,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomBottomSheet from '../../components/ui/BottomSheet';
import { COLORS } from '../../theme/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const OrderTrackingScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [currentState, setCurrentState] = useState<'preparing' | 'tracking' | 'delivered'>('preparing');

    // Animation Values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        vehicle: 'Honda Activa',
        plate: 'KA 03 AB 4721',
        rating: 4.8,
        deliveries: 1240,
    };

    const restaurantLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
    };
    const userLocation = {
        latitude: 37.7849,
        longitude: -122.4294,
    };

    const steps = [
        { id: 1, title: 'Order Confirmed', time: '5:30 PM', sub: 'We have received your order' },
        { id: 2, title: 'Preparing', time: '5:35 PM', sub: 'Chef is cooking your meal' },
        { id: 3, title: 'Picked Up', time: '5:50 PM', sub: 'Rider is on the way' },
        { id: 4, title: 'Out for Delivery', time: 'On the way', sub: 'Arriving in 10 mins' },
        { id: 5, title: 'Delivered', time: '---', sub: 'Enjoy your meal!' },
    ];

    const getActiveStep = () => {
        if (currentState === 'preparing') return 2;
        if (currentState === 'tracking') return 4;
        return 5;
    };
    const activeStep = getActiveStep();

    const getStatusText = () => {
        if (currentState === 'preparing') return 'Preparing your delicious meal...';
        if (currentState === 'tracking') return 'Heading to your location!';
        return 'Arrived!';
    };

    // Animations
    useEffect(() => {
        // Pulse animation for rider marker
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Fade in main view
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

    }, [currentState]);

    // Rider movement simulation
    useEffect(() => {
        if (currentState === 'tracking') {
            const interval = setInterval(() => {
                setRiderLocation(prev => ({
                    latitude: prev.latitude + (Math.random() - 0.5) * 0.0005,
                    longitude: prev.longitude + (Math.random() - 0.5) * 0.0005,
                }));
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [currentState]);

    // Auto-open bottom sheet
    useEffect(() => {
        if (currentState !== 'delivered') {
            setTimeout(() => bottomSheetRef.current?.open(1), 500);
        }
    }, [currentState]);

    const routeCoordinates = currentState === 'tracking' ? [
        restaurantLocation,
        riderLocation,
        userLocation,
    ] : [];

    // --- RENDER HELPERS ---

    const renderTimeline = () => (
        <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.id} style={styles.timelineItem}>
                        {/* Line */}
                        {!isLast && (
                            <View style={[
                                styles.timelineLine,
                                { backgroundColor: isCompleted ? COLORS.primary : '#E0E0E0' }
                            ]} />
                        )}

                        {/* Dot */}
                        <View style={[
                            styles.timelineDot,
                            (isActive || isCompleted) && styles.timelineDotActive,
                            isActive && styles.timelineDotPulse
                        ]}>
                            {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
                            {isActive && <View style={styles.innerDot} />}
                        </View>

                        {/* Content */}
                        <View style={styles.timelineContent}>
                            <Text style={[
                                styles.stepTitle,
                                (isActive || isCompleted) && styles.stepTitleActive
                            ]}>{step.title}</Text>
                            <Text style={styles.stepSub}>{step.sub}</Text>
                        </View>
                        <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                )
            })}
        </View>
    );

    if (currentState === 'delivered') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[COLORS.primary, '#7e22ce']}
                    style={styles.deliveredContainer}
                >
                    <SafeAreaView style={styles.deliveredSafeArea}>
                        <Animated.View style={[styles.successContent, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={80} color={COLORS.primary} />
                            </View>
                            <Text style={styles.deliveredTitle}>Enjoy Your Meal!</Text>
                            <Text style={styles.deliveredSub}>Order delivered successfully by Ravi.</Text>

                            <View style={styles.ratingCard}>
                                <Text style={styles.rateTitle}>Rate your Delivery</Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Ionicons key={s} name="star-outline" size={32} color="#FFD700" style={{ marginHorizontal: 4 }} />
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.homeButton}
                                onPress={() => navigation?.goBack()}
                            >
                                <Text style={styles.homeButtonText}>Back to Home</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* --- MAP --- */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
                customMapStyle={mapStyle} // Minimalist aesthetic
                provider={PROVIDER_GOOGLE}
            >
                <Marker coordinate={restaurantLocation}>
                    <View style={styles.markerContainer}>
                        <View style={[styles.markerIcon, { backgroundColor: COLORS.white }]}>
                            <Ionicons name="restaurant" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.markerArrow} />
                    </View>
                </Marker>

                <Marker coordinate={userLocation}>
                    <View style={styles.markerContainer}>
                        <View style={[styles.markerIcon, { backgroundColor: COLORS.primary }]}>
                            <Ionicons name="home" size={20} color={COLORS.white} />
                        </View>
                        <View style={[styles.markerArrow, { borderTopColor: COLORS.primary }]} />
                    </View>
                </Marker>

                {currentState === 'tracking' && (
                    <Marker coordinate={riderLocation} anchor={{ x: 0.5, y: 0.5 }}>
                        <Animated.View style={[
                            styles.riderMarkerWrap,
                            { transform: [{ scale: pulseAnim }] }
                        ]}>
                            <View style={styles.riderHalo} />
                            <View style={styles.riderIcon}>
                                <Ionicons name="bicycle" size={18} color="white" />
                            </View>
                        </Animated.View>
                    </Marker>
                )}

                {currentState === 'tracking' && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor={COLORS.primary}
                        strokeWidth={4}
                    />
                )}
            </MapView>

            {/* --- TOP BAR (SafeArea Aware) --- */}
            <View style={[styles.topBar, { top: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.topBarLabel}>
                    <Text style={styles.topBarTitle}>Order #{order.id.replace('#', '')}</Text>
                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusPillText}>{currentState === 'tracking' ? 'On the way' : 'Preparing'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpText}>Help</Text>
                </TouchableOpacity>
            </View>

            {/* --- BOTTOM SHEET --- */}
            <CustomBottomSheet
                ref={bottomSheetRef}
                snapPoints={['18%', '45%', '85%']}
                initialSnapIndex={1}
                containerStyle={styles.sheetContainer}
                handleIndicatorStyle={styles.sheetHandle}
                backdropComponent={false}
            >
                <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
                    <ScrollView
                        style={styles.sheetContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header: ETA & Status */}
                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={styles.etaActive}>{order.eta}</Text>
                                <Text style={styles.etaLabel}>{getStatusText()}</Text>
                            </View>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' }}
                                style={styles.headerIcon}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Rider Card */}
                        <View style={styles.riderCard}>
                            <View style={styles.riderInfo}>
                                <Image source={{ uri: rider.photo }} style={styles.riderAvatar} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.riderName}>{rider.name}</Text>
                                    <Text style={styles.riderPlate}>{rider.vehicle} • {rider.plate}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#FFF" />
                                        <Text style={styles.ratingVal}>{rider.rating}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.riderActions}>
                                <TouchableOpacity style={styles.callResult}>
                                    <Ionicons name="call" size={24} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.messageResult}>
                                    <Ionicons name="chatbubble" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Timeline */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Timeline</Text>
                        </View>
                        {renderTimeline()}

                        {/* Order Details */}
                        <View style={styles.detailsBox}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            <Text style={styles.detailResName}>{order.restaurant}</Text>
                            {order.items.map((item, i) => (
                                <Text key={i} style={styles.detailItem}>• {item}</Text>
                            ))}
                            <View style={styles.divider} />
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Bill</Text>
                                <Text style={styles.totalValue}>{order.total}</Text>
                            </View>
                        </View>

                        {/* Debug Buttons */}
                        <TouchableOpacity
                            style={styles.debugBtn}
                            onPress={() => {
                                if (currentState === 'preparing') setCurrentState('tracking');
                                else if (currentState === 'tracking') setCurrentState('delivered');
                                else setCurrentState('preparing');
                            }}
                        >
                            <Text style={styles.debugText}>Simulate Next Step ({currentState})</Text>
                        </TouchableOpacity>

                        {/* Space for scrolling */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </SafeAreaView>
            </CustomBottomSheet>
        </View>
    );
};

// --- STYLES ---

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            { "color": "#f5f5f5" }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#616161" }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            { "color": "#f5f5f5" }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#bdbdbd" }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            { "color": "#eeeeee" }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#757575" }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            { "color": "#e5e5e5" }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#9e9e9e" }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            { "color": "#ffffff" }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#757575" }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            { "color": "#dadada" }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#616161" }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#9e9e9e" }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            { "color": "#e5e5e5" }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            { "color": "#eeeeee" }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            { "color": "#c9c9c9" }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            { "color": "#9e9e9e" }
        ]
    }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    map: {
        flex: 1,
        // The map takes full height behind everything
    },

    // Top Bar
    topBar: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 99,
    },
    backButton: {
        padding: 4,
    },
    topBarLabel: {
        flex: 1,
        alignItems: 'center',
    },
    topBarTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
        marginRight: 6,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    helpButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
    },
    helpText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Markers
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.white,
        marginTop: -1,
    },
    riderMarkerWrap: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
    },
    riderHalo: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(135, 25, 198, 0.3)',
    },
    riderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },

    // Bottom Sheet
    sheetContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
    },
    sheetHandle: {
        backgroundColor: '#E0E0E0',
        width: 50,
        height: 5,
    },
    sheetContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 100, // Added padding to prevent bottom sheet content from being hidden
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    etaActive: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        // fontFamily: 'Poppins-Bold', // Ensure font is available or use standard
    },
    etaLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    headerIcon: {
        width: 64,
        height: 64,
        resizeMode: 'contain',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },

    // Rider Card
    riderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    riderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    riderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    riderName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    riderPlate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    ratingVal: {
        fontSize: 10,
        fontWeight: '700',
        color: 'white',
        marginLeft: 2,
    },
    riderActions: {
        flexDirection: 'row',
        gap: 12,
    },
    callResult: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3E8FF', // Light purple
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageResult: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    // Timeline
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    timelineContainer: {
        marginLeft: 8,
        marginBottom: 24,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24, // Spacing between steps
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 20,
        left: 9, // Center of dot
        width: 2,
        height: '100%',
        zIndex: 0,
    },
    timelineDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        borderWidth: 3,
        borderColor: '#F9FAFB',
        zIndex: 1,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineDotActive: {
        backgroundColor: COLORS.primary,
        borderColor: '#F3E8FF', // Light purple halo
    },
    timelineDotPulse: {
        // Can add pulse styles here
    },
    innerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
    },
    timelineContent: {
        flex: 1,
        marginTop: -2,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    stepTitleActive: {
        color: COLORS.textPrimary,
        fontWeight: '800',
    },
    stepSub: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    stepTime: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        minWidth: 50,
        textAlign: 'right',
    },

    // Details Box
    detailsBox: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
    },
    detailResName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 8,
        marginBottom: 8,
    },
    detailItem: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    debugBtn: {
        alignSelf: 'center',
        marginTop: 10,
        padding: 10,
    },
    debugText: {
        color: COLORS.muted,
        fontSize: 12,
    },

    // Delivered Screen
    deliveredContainer: {
        flex: 1,
    },
    deliveredSafeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successContent: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 20,
    },
    checkCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    deliveredTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    deliveredSub: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    ratingCard: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    rateTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.muted,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    starsRow: {
        flexDirection: 'row',
    },
    homeButton: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default OrderTrackingScreen;