// import { useState, useRef, useEffect } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Image,
//     Dimensions,
//     Animated,
//     ScrollView,
// } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import BottomSheet from '@gorhom/bottom-sheet';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const { height: screenHeight } = Dimensions.get('window');
// const mapHeight = screenHeight * 0.6;

// export const COLORS = {
//     primary: '#8719C6',    // Deep Purple (for buttons, highlights)
//     secondary: '#f9eae9',  // Soft Pink (for backgrounds, cards)
//     accent: '#b58ff0',     // Lavender (hover, subtle accents)
//     highlight: '#ff9fa3',  // Coral/Peach (alerts, badges)
//     background: '#fafafa', // Default background
//     white: '#ffffff',       // White color
//     textPrimary: '#222222', // Main text
//     textSecondary: '#4a4a4a', // Secondary text
//     muted: '#888888',       // Muted text or icons
// };

// const OrderTrackingScreen = () => {
//     const [currentState, setCurrentState] = useState<'preparing' | 'tracking' | 'delivered'>('preparing');
//     const [riderLocation, setRiderLocation] = useState({
//         latitude: 37.7749,
//         longitude: -122.4194,
//     });
//     const bottomSheetRef = useRef<BottomSheet>(null);
//     const scaleValue = useRef(new Animated.Value(0)).current;

//     // Mock data
//     const order = {
//         id: '#ORD-9823',
//         restaurant: 'Pizza Hut - MG Road',
//         location: '123 MG Road, Bangalore',
//         items: ['Margherita Pizza x1', 'Garlic Bread x2'],
//         total: '₹450',
//         payment: 'UPI',
//         eta: '14 mins',
//         deliveryTime: '7:45 – 8:00 PM',
//     };

//     const rider = {
//         name: 'Ravi Kumar',
//         photo: 'https://via.placeholder.com/60x60?text=RV', // Placeholder image
//         vehicle: 'Honda Activa - KA 03 AB 4721',
//         rating: 4.8,
//         deliveries: 320,
//     };

//     // Map coordinates (mock San Francisco area for demo)
//     const restaurantLocation = {
//         latitude: 37.7749,
//         longitude: -122.4194,
//     };
//     const userLocation = {
//         latitude: 37.7849,
//         longitude: -122.4294,
//     };

//     // Progress steps
//     const steps = [
//         { id: 1, title: 'Order Confirmed', time: '5 mins ago', icon: 'checkmark-circle' },
//         { id: 2, title: 'Restaurant Preparing', time: '2 mins remaining', icon: 'restaurant' },
//         { id: 3, title: 'Picked Up', time: '3 mins ago', icon: 'bag-handle' },
//         { id: 4, title: 'Out for Delivery', time: 'Now', icon: 'bicycle' },
//         { id: 5, title: 'Delivered', time: 'Just now', icon: 'home' },
//     ];

//     // Determine active step and update times based on state
//     const getActiveStep = () => {
//         if (currentState === 'preparing') return 2;
//         if (currentState === 'tracking') return 4;
//         return 5;
//     };

//     const activeStep = getActiveStep();

//     // Status text
//     const getStatusText = () => {
//         if (currentState === 'preparing') return 'Preparing your order 👨‍🍳';
//         if (currentState === 'tracking') return 'Your order is on the way 🚴‍♂️';
//         return '';
//     };

//     // Simulate rider movement in tracking state
//     useEffect(() => {
//         if (currentState === 'tracking') {
//             const interval = setInterval(() => {
//                 setRiderLocation(prev => ({
//                     latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
//                     longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
//                 }));
//             }, 2000);
//             return () => clearInterval(interval);
//         }
//     }, [currentState]);

//     // Animate scale for delivered state
//     useEffect(() => {
//         if (currentState === 'delivered') {
//             Animated.spring(scaleValue, {
//                 toValue: 1,
//                 useNativeDriver: true,
//                 tension: 50,
//                 friction: 5,
//             }).start();
//         }
//     }, [currentState]);

//     // Polyline coordinates for route
//     const routeCoordinates = currentState === 'tracking' ? [
//         restaurantLocation,
//         riderLocation,
//         userLocation,
//     ] : [];

//     if (currentState === 'delivered') {
//         return (
//             <View style={styles.container}>
//                 <View
//                     style={[
//                         styles.deliveredGradient,
//                         { backgroundColor: COLORS.primary }
//                     ]}
//                 >
//                     <Animated.View
//                         style={[
//                             styles.successContainer,
//                             {
//                                 transform: [{ scale: scaleValue }],
//                             },
//                         ]}
//                     >
//                         <Ionicons name="checkmark-circle" size={120} color={COLORS.white} />
//                         <Text style={styles.successTitle}>Order Delivered Successfully!</Text>
//                         <Text style={styles.successSubtitle}>Enjoy your meal 🎉</Text>
//                         <TouchableOpacity style={styles.feedbackButton}>
//                             <Text style={styles.feedbackButtonText}>Rate Your Experience</Text>
//                         </TouchableOpacity>
//                     </Animated.View>
//                 </View>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {/* Top Navigation Bar */}
//             <View
//                 style={[
//                     styles.topBar,
//                     { backgroundColor: 'rgba(255,255,255,0.8)' }
//                 ]}
//             >
//                 <TouchableOpacity style={styles.iconButton}>
//                     <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
//                 </TouchableOpacity>
//                 <Text style={styles.title}>Track Order</Text>
//                 <TouchableOpacity style={styles.iconButton}>
//                     <Ionicons name="help-circle-outline" size={24} color={COLORS.textPrimary} />
//                 </TouchableOpacity>
//             </View>

//             {/* Live Map Section */}
//             <MapView
//                 style={styles.map}
//                 initialRegion={{
//                     latitude: userLocation.latitude,
//                     longitude: userLocation.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                 }}
//                 showsUserLocation={true}
//                 showsMyLocationButton={true}
//             >
//                 {/* Restaurant Marker */}
//                 <Marker
//                     coordinate={restaurantLocation}
//                     title="Restaurant"
//                     description={order.restaurant}
//                     pinColor={currentState === 'preparing' ? COLORS.primary : COLORS.muted}
//                 >
//                     <View style={styles.customMarker}>
//                         <Ionicons name="restaurant-outline" size={30} color={COLORS.primary} />
//                     </View>
//                 </Marker>

//                 {/* User Location Marker */}
//                 <Marker coordinate={userLocation} title="Your Location" pinColor="green">
//                     <View style={styles.customMarker}>
//                         <Ionicons name="home-outline" size={30} color="green" />
//                     </View>
//                 </Marker>

//                 {/* Rider Marker (only in tracking) */}
//                 {currentState === 'tracking' && (
//                     <Marker coordinate={riderLocation} title="Delivery Partner" anchor={{ x: 0.5, y: 1 }}>
//                         <View style={styles.riderMarker}>
//                             <Ionicons name="bicycle" size={30} color={COLORS.primary} />
//                             <View style={styles.pulse} />
//                         </View>
//                     </Marker>
//                 )}

//                 {/* Route Polyline (only in tracking) */}
//                 {currentState === 'tracking' && (
//                     <Polyline
//                         coordinates={routeCoordinates}
//                         strokeColor={COLORS.primary}
//                         strokeWidth={4}
//                         lineDashPattern={[5, 5]}
//                     />
//                 )}
//             </MapView>

//             {/* ETA Badge */}
//             <View style={styles.etaBadge}>
//                 <Ionicons name="clock-outline" size={16} color={COLORS.white} />
//                 <Text style={styles.etaText}>Arriving in {order.eta}</Text>
//             </View>

//             {/* Live Status Bar */}
//             <View style={styles.statusBar}>
//                 <Text style={styles.statusText}>{getStatusText()}</Text>
//             </View>

//             {/* Collapsible Bottom Sheet */}
//             <BottomSheet
//                 ref={bottomSheetRef}
//                 index={1}
//                 snapPoints={['50%', '90%']}
//                 enablePanDownToClose={false}
//                 backgroundStyle={styles.bottomSheetBackground}
//                 handleIndicatorStyle={styles.handleIndicator}
//             >
//                 <ScrollView style={styles.bottomSheetContent}>
//                     {/* Delivery Partner Info */}
//                     <View style={styles.partnerSection}>
//                         <Image source={{ uri: rider.photo }} style={styles.partnerPhoto} />
//                         <View style={styles.partnerDetails}>
//                             <Text style={styles.partnerName}>{rider.name}</Text>
//                             <Text style={styles.vehicleText}>{rider.vehicle}</Text>
//                             <View style={styles.ratingContainer}>
//                                 <Ionicons name="star" size={16} color="#FFD700" />
//                                 <Text style={styles.ratingText}>{rider.rating} • {rider.deliveries} deliveries</Text>
//                             </View>
//                         </View>
//                         <View style={styles.partnerActions}>
//                             <TouchableOpacity style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
//                                 <Ionicons name="call-outline" size={20} color={COLORS.white} />
//                             </TouchableOpacity>
//                             <TouchableOpacity style={[styles.actionIcon, { backgroundColor: COLORS.accent }]}>
//                                 <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* Order Progress Tracker */}
//                     <View style={styles.progressSection}>
//                         <Text style={styles.sectionTitle}>Order Progress</Text>
//                         <View style={styles.progressTracker}>
//                             {steps.map((step, index) => {
//                                 const isActive = activeStep === step.id;
//                                 const isCompleted = activeStep > step.id;
//                                 return (
//                                     <View key={step.id} style={styles.stepContainer}>
//                                         <View
//                                             style={[
//                                                 styles.stepIcon,
//                                                 isCompleted && { backgroundColor: COLORS.primary },
//                                                 isActive && { backgroundColor: COLORS.highlight },
//                                             ]}
//                                         >
//                                             <Ionicons
//                                                 name={isCompleted ? 'checkmark' : step.icon as any}
//                                                 size={20}
//                                                 color={isActive ? COLORS.primary : COLORS.white}
//                                             />
//                                         </View>
//                                         <View style={styles.stepLine} />
//                                         <View style={styles.stepContent}>
//                                             <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>
//                                                 {step.title}
//                                             </Text>
//                                             <Text style={styles.stepTime}>{step.time}</Text>
//                                         </View>
//                                     </View>
//                                 );
//                             })}
//                         </View>
//                     </View>

//                     {/* Order Details Summary */}
//                     <View style={styles.detailsSection}>
//                         <Text style={styles.sectionTitle}>Order Details</Text>
//                         <Text style={styles.restaurantName}>{order.restaurant}</Text>
//                         <Text style={styles.restaurantLocation}>{order.location}</Text>
//                         <View style={styles.itemsList}>
//                             {order.items.map((item, index) => (
//                                 <Text key={index} style={styles.itemText}>- {item}</Text>
//                             ))}
//                         </View>
//                         <View style={styles.orderRow}>
//                             <Text style={styles.label}>Total:</Text>
//                             <Text style={styles.value}>{order.total}</Text>
//                         </View>
//                         <View style={styles.orderRow}>
//                             <Text style={styles.label}>Payment:</Text>
//                             <Text style={styles.value}>{order.payment}</Text>
//                         </View>
//                         <View style={styles.orderRow}>
//                             <Text style={styles.label}>Order ID:</Text>
//                             <Text style={styles.value}>{order.id}</Text>
//                         </View>
//                         <TouchableOpacity style={styles.linkButton}>
//                             <Text style={styles.linkText}>View Invoice</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Additional Actions */}
//                     <View style={styles.actionsSection}>
//                         <Text style={styles.etaRange}>Estimated Delivery: {order.deliveryTime}</Text>
//                         <TouchableOpacity style={styles.actionButton}>
//                             <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
//                             <Text style={styles.actionButtonText}>Chat with Support</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={[styles.actionButton, { opacity: currentState === 'preparing' ? 1 : 0.5 }]}
//                             disabled={currentState !== 'preparing'}
//                         >
//                             <Ionicons name="close-circle-outline" size={20} color={COLORS.highlight} />
//                             <Text style={[styles.actionButtonText, { color: currentState === 'preparing' ? COLORS.textPrimary : COLORS.muted }]}>
//                                 Cancel Order
//                             </Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.actionButton}>
//                             <Ionicons name="share-outline" size={20} color={COLORS.primary} />
//                             <Text style={styles.actionButtonText}>Share Tracking Link</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </ScrollView>
//             </BottomSheet>

//             {/* Demo Button to Switch States (Remove in production) */}
//             <TouchableOpacity
//                 style={styles.demoButton}
//                 onPress={() => {
//                     if (currentState === 'preparing') setCurrentState('tracking');
//                     else if (currentState === 'tracking') setCurrentState('delivered');
//                     else setCurrentState('preparing');
//                 }}
//             >
//                 <Text style={styles.demoButtonText}>Switch to {currentState === 'preparing' ? 'Tracking' : currentState === 'tracking' ? 'Delivered' : 'Preparing'}</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     topBar: {
//         position: 'absolute',
//         top: 50,
//         left: 0,
//         right: 0,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         zIndex: 100,
//         borderRadius: 16,
//         margin: 16,
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     iconButton: {
//         padding: 8,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         fontFamily: 'Poppins-Bold', // Assume Poppins is linked
//     },
//     map: {
//         flex: 1,
//         height: mapHeight,
//         width: '100%',
//     },
//     customMarker: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: COLORS.white,
//         borderRadius: 20,
//         padding: 4,
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.2,
//         shadowRadius: 2,
//     },
//     riderMarker: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: COLORS.primary,
//         borderRadius: 20,
//         padding: 8,
//         elevation: 4,
//     },
//     pulse: {
//         position: 'absolute',
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: COLORS.accent,
//         opacity: 0.5,
//     },
//     etaBadge: {
//         position: 'absolute',
//         top: 120,
//         right: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 20,
//         elevation: 4,
//     },
//     etaText: {
//         color: COLORS.white,
//         fontSize: 14,
//         marginLeft: 4,
//         fontFamily: 'Poppins-Medium',
//     },
//     statusBar: {
//         position: 'absolute',
//         bottom: 100, // Above bottom sheet
//         left: 16,
//         right: 16,
//         backgroundColor: COLORS.secondary,
//         padding: 12,
//         borderRadius: 12,
//         alignItems: 'center',
//     },
//     statusText: {
//         fontSize: 16,
//         color: COLORS.textPrimary,
//         fontFamily: 'Poppins-Regular',
//     },
//     bottomSheetBackground: {
//         backgroundColor: COLORS.secondary,
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//     },
//     handleIndicator: {
//         backgroundColor: COLORS.muted,
//         width: 40,
//         height: 4,
//         borderRadius: 2,
//     },
//     bottomSheetContent: {
//         flex: 1,
//         padding: 16,
//     },
//     partnerSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 24,
//         paddingBottom: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(0,0,0,0.1)',
//     },
//     partnerPhoto: {
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         marginRight: 16,
//     },
//     partnerDetails: {
//         flex: 1,
//     },
//     partnerName: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         fontFamily: 'Poppins-Bold',
//         marginBottom: 4,
//     },
//     vehicleText: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//         fontFamily: 'Poppins-Regular',
//         marginBottom: 4,
//     },
//     ratingContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     ratingText: {
//         fontSize: 12,
//         color: COLORS.muted,
//         marginLeft: 4,
//         fontFamily: 'Poppins-Regular',
//     },
//     partnerActions: {
//         flexDirection: 'column',
//         alignItems: 'center',
//     },
//     actionIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     progressSection: {
//         marginBottom: 24,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         marginBottom: 16,
//         fontFamily: 'Poppins-Bold',
//     },
//     progressTracker: {
//         alignItems: 'center',
//     },
//     stepContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//         width: '100%',
//     },
//     stepIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: COLORS.muted,
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 1,
//     },
//     stepLine: {
//         position: 'absolute',
//         left: 20,
//         top: 40,
//         width: 2,
//         height: '100%',
//         backgroundColor: COLORS.muted,
//         zIndex: 0,
//     },
//     stepContent: {
//         marginLeft: 16,
//         flex: 1,
//     },
//     stepTitle: {
//         fontSize: 16,
//         color: COLORS.textSecondary,
//         fontFamily: 'Poppins-Regular',
//         marginBottom: 4,
//     },
//     activeStepTitle: {
//         color: COLORS.primary,
//         fontWeight: 'bold',
//         fontFamily: 'Poppins-Bold',
//     },
//     stepTime: {
//         fontSize: 12,
//         color: COLORS.muted,
//         fontFamily: 'Poppins-Regular',
//     },
//     detailsSection: {
//         marginBottom: 24,
//     },
//     restaurantName: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         marginBottom: 4,
//         fontFamily: 'Poppins-Bold',
//     },
//     restaurantLocation: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//         marginBottom: 12,
//         fontFamily: 'Poppins-Regular',
//     },
//     itemsList: {
//         marginBottom: 12,
//     },
//     itemText: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//         marginBottom: 4,
//         fontFamily: 'Poppins-Regular',
//     },
//     orderRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 4,
//     },
//     label: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//         fontFamily: 'Poppins-Regular',
//     },
//     value: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: COLORS.textPrimary,
//         fontFamily: 'Poppins-Bold',
//     },
//     linkButton: {
//         marginTop: 8,
//     },
//     linkText: {
//         fontSize: 14,
//         color: COLORS.primary,
//         fontFamily: 'Poppins-Medium',
//     },
//     actionsSection: {
//         paddingTop: 16,
//         borderTopWidth: 1,
//         borderTopColor: 'rgba(0,0,0,0.1)',
//     },
//     etaRange: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//         marginBottom: 16,
//         textAlign: 'center',
//         fontFamily: 'Poppins-Regular',
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 16,
//         backgroundColor: COLORS.white,
//         borderRadius: 12,
//         marginBottom: 12,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//     },
//     actionButtonText: {
//         fontSize: 16,
//         color: COLORS.textPrimary,
//         marginLeft: 12,
//         fontFamily: 'Poppins-Regular',
//     },
//     deliveredGradient: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     successContainer: {
//         alignItems: 'center',
//         padding: 40,
//     },
//     successTitle: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: COLORS.white,
//         marginTop: 16,
//         marginBottom: 8,
//         textAlign: 'center',
//         fontFamily: 'Poppins-Bold',
//     },
//     successSubtitle: {
//         fontSize: 16,
//         color: COLORS.white,
//         marginBottom: 32,
//         opacity: 0.9,
//         fontFamily: 'Poppins-Regular',
//     },
//     feedbackButton: {
//         backgroundColor: COLORS.white,
//         paddingHorizontal: 32,
//         paddingVertical: 16,
//         borderRadius: 24,
//         elevation: 4,
//     },
//     feedbackButtonText: {
//         fontSize: 16,
//         color: COLORS.primary,
//         fontWeight: 'bold',
//         fontFamily: 'Poppins-Bold',
//     },
//     demoButton: {
//         position: 'absolute',
//         bottom: 100,
//         left: '50%',
//         transform: [{ translateX: -75 }],
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 20,
//         zIndex: 1000,
//     },
//     demoButtonText: {
//         color: COLORS.white,
//         fontSize: 14,
//         fontFamily: 'Poppins-Medium',
//     },
// });

// export default OrderTrackingScreen;


// import { useState, useRef, useEffect } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Image,
//     Dimensions,
//     Animated,
//     ScrollView,
// } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import CustomBottomSheet from '../../components/ui/BottomSheet';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// export const COLORS = {
//     primary: '#6C5CE7',
//     primaryDark: '#5849C7',
//     primaryLight: '#A29BFE',
//     secondary: '#FFE5F0',
//     accent: '#FF6B9D',
//     accentLight: '#FFB8D2',
//     success: '#00D9A3',
//     warning: '#FFA940',
//     background: '#F8F9FA',
//     white: '#FFFFFF',
//     textPrimary: '#2D3436',
//     textSecondary: '#636E72',
//     muted: '#B2BEC3',
//     border: '#DFE6E9',
//     shadow: 'rgba(108, 92, 231, 0.15)',
// };

// const OrderTrackingScreen = () => {
//     const [currentState, setCurrentState] = useState<'preparing' | 'tracking' | 'delivered'>('preparing');
//     const [riderLocation, setRiderLocation] = useState({
//         latitude: 37.7749,
//         longitude: -122.4194,
//     });
//     const bottomSheetRef = useRef<any>(null);
//     const scaleValue = useRef(new Animated.Value(0)).current;
//     const pulseAnim = useRef(new Animated.Value(1)).current;

//     // Mock data
//     const order = {
//         id: '#ORD-9823',
//         restaurant: 'Pizza Hut - MG Road',
//         location: '123 MG Road, Bangalore',
//         items: [
//             { name: 'Margherita Pizza', quantity: 1, price: '₹320' },
//             { name: 'Garlic Bread', quantity: 2, price: '₹130' }
//         ],
//         total: '₹450',
//         payment: 'UPI',
//         eta: '14 mins',
//         deliveryTime: '7:45 – 8:00 PM',
//     };

//     const rider = {
//         name: 'Ravi Kumar',
//         photo: 'https://i.pravatar.cc/150?img=12',
//         vehicle: 'Honda Activa',
//         vehicleNumber: 'KA 03 AB 4721',
//         rating: 4.8,
//         deliveries: 320,
//     };

//     // Map coordinates
//     const restaurantLocation = { latitude: 37.7749, longitude: -122.4194 };
//     const userLocation = { latitude: 37.7849, longitude: -122.4294 };

//     // Progress steps
//     const steps = [
//         { id: 1, title: 'Order Confirmed', time: '5 mins ago', icon: 'checkmark-circle', status: 'completed' },
//         { id: 2, title: 'Restaurant Preparing', time: '2 mins remaining', icon: 'restaurant', status: currentState === 'preparing' ? 'active' : 'completed' },
//         { id: 3, title: 'Picked Up', time: '3 mins ago', icon: 'bag-handle', status: currentState === 'tracking' || currentState === 'delivered' ? 'completed' : 'pending' },
//         { id: 4, title: 'Out for Delivery', time: 'Now', icon: 'bicycle', status: currentState === 'tracking' ? 'active' : currentState === 'delivered' ? 'completed' : 'pending' },
//         { id: 5, title: 'Delivered', time: 'Just now', icon: 'home', status: currentState === 'delivered' ? 'completed' : 'pending' },
//     ];

//     // Pulse animation for rider marker
//     useEffect(() => {
//         Animated.loop(
//             Animated.sequence([
//                 Animated.timing(pulseAnim, {
//                     toValue: 1.3,
//                     duration: 1000,
//                     useNativeDriver: true,
//                 }),
//                 Animated.timing(pulseAnim, {
//                     toValue: 1,
//                     duration: 1000,
//                     useNativeDriver: true,
//                 }),
//             ])
//         ).start();
//     }, []);

//     // Simulate rider movement
//     useEffect(() => {
//         if (currentState === 'tracking') {
//             const interval = setInterval(() => {
//                 setRiderLocation(prev => ({
//                     latitude: prev.latitude + (Math.random() - 0.5) * 0.0005,
//                     longitude: prev.longitude + (Math.random() - 0.5) * 0.0005,
//                 }));
//             }, 3000);
//             return () => clearInterval(interval);
//         }
//     }, [currentState]);

//     // Delivered animation
//     useEffect(() => {
//         if (currentState === 'delivered') {
//             Animated.spring(scaleValue, {
//                 toValue: 1,
//                 useNativeDriver: true,
//                 tension: 50,
//                 friction: 5,
//             }).start();
//         }
//     }, [currentState]);

//     // Route coordinates
//     const routeCoordinates = currentState === 'tracking' ? [
//         restaurantLocation,
//         riderLocation,
//         userLocation,
//     ] : [];

//     // Status text
//     const getStatusInfo = () => {
//         if (currentState === 'preparing') return {
//             text: 'Preparing your delicious meal',
//             emoji: '👨‍🍳',
//             color: COLORS.warning
//         };
//         if (currentState === 'tracking') return {
//             text: 'Your order is on the way',
//             emoji: '🚴‍♂️',
//             color: COLORS.success
//         };
//         return { text: '', emoji: '', color: COLORS.primary };
//     };

//     const statusInfo = getStatusInfo();

//     if (currentState === 'delivered') {
//         return (
//             <View style={styles.container}>
//                 <View style={[styles.deliveredContainer, { backgroundColor: COLORS.primary }]}>
//                     <Animated.View
//                         style={[
//                             styles.successContainer,
//                             { transform: [{ scale: scaleValue }] },
//                         ]}
//                     >
//                         <View style={styles.successIconContainer}>
//                             <Ionicons name="checkmark-circle" size={100} color={COLORS.white} />
//                             <View style={styles.successRing} />
//                         </View>
//                         <Text style={styles.successTitle}>Order Delivered! 🎉</Text>
//                         <Text style={styles.successSubtitle}>
//                             Hope you enjoy your meal from {order.restaurant}
//                         </Text>

//                         <View style={styles.deliveredDetails}>
//                             <View style={styles.deliveredRow}>
//                                 <Text style={styles.deliveredLabel}>Order ID</Text>
//                                 <Text style={styles.deliveredValue}>{order.id}</Text>
//                             </View>
//                             <View style={styles.deliveredRow}>
//                                 <Text style={styles.deliveredLabel}>Total Amount</Text>
//                                 <Text style={styles.deliveredValue}>{order.total}</Text>
//                             </View>
//                         </View>

//                         <TouchableOpacity style={styles.feedbackButton}>
//                             <Ionicons name="star-outline" size={20} color={COLORS.primary} />
//                             <Text style={styles.feedbackButtonText}>Rate Your Experience</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity style={styles.secondaryButton}>
//                             <Text style={styles.secondaryButtonText}>View Receipt</Text>
//                         </TouchableOpacity>
//                     </Animated.View>
//                 </View>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {/* Map Section */}
//             <MapView
//                 style={styles.map}
//                 initialRegion={{
//                     latitude: (restaurantLocation.latitude + userLocation.latitude) / 2,
//                     longitude: (restaurantLocation.longitude + userLocation.longitude) / 2,
//                     latitudeDelta: 0.02,
//                     longitudeDelta: 0.02,
//                 }}
//                 showsUserLocation={false}
//                 showsMyLocationButton={false}
//                 mapType="standard"
//             >
//                 {/* Restaurant Marker */}
//                 <Marker coordinate={restaurantLocation} anchor={{ x: 0.5, y: 0.5 }}>
//                     <View style={[styles.markerContainer, { backgroundColor: COLORS.warning }]}>
//                         <Ionicons name="restaurant" size={24} color={COLORS.white} />
//                     </View>
//                 </Marker>

//                 {/* User Location Marker */}
//                 <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
//                     <View style={[styles.markerContainer, { backgroundColor: COLORS.success }]}>
//                         <Ionicons name="home" size={24} color={COLORS.white} />
//                     </View>
//                 </Marker>

//                 {/* Rider Marker */}
//                 {currentState === 'tracking' && (
//                     <Marker coordinate={riderLocation} anchor={{ x: 0.5, y: 0.5 }}>
//                         <View style={styles.riderMarkerContainer}>
//                             <Animated.View
//                                 style={[
//                                     styles.riderPulse,
//                                     { transform: [{ scale: pulseAnim }] }
//                                 ]}
//                             />
//                             <View style={styles.riderMarker}>
//                                 <Ionicons name="bicycle" size={26} color={COLORS.white} />
//                             </View>
//                         </View>
//                     </Marker>
//                 )}

//                 {/* Route Polyline */}
//                 {currentState === 'tracking' && (
//                     <Polyline
//                         coordinates={routeCoordinates}
//                         strokeColor={COLORS.primary}
//                         strokeWidth={3}
//                         lineDashPattern={[1]}
//                     />
//                 )}
//             </MapView>

//             {/* Top Header */}
//             <View style={styles.topHeader}>
//                 <TouchableOpacity style={styles.headerButton}>
//                     <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
//                 </TouchableOpacity>
//                 <View style={styles.headerCenter}>
//                     <Text style={styles.headerTitle}>Track Order</Text>
//                     <Text style={styles.headerSubtitle}>{order.id}</Text>
//                 </View>
//                 <TouchableOpacity style={styles.headerButton}>
//                     <Ionicons name="call-outline" size={24} color={COLORS.textPrimary} />
//                 </TouchableOpacity>
//             </View>

//             {/* ETA Card */}
//             <View style={styles.etaCard}>
//                 <View style={styles.etaContent}>
//                     <View style={[styles.etaIconContainer, { backgroundColor: statusInfo.color }]}>
//                         <Ionicons name="time-outline" size={24} color={COLORS.white} />
//                     </View>
//                     <View style={styles.etaTextContainer}>
//                         <Text style={styles.etaTime}>{order.eta}</Text>
//                         <Text style={styles.etaLabel}>Estimated Arrival</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Status Banner */}
//             <View style={styles.statusBanner}>
//                 <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
//                 <Text style={styles.statusText}>
//                     {statusInfo.text} <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
//                 </Text>
//             </View>

//             {/* Custom Bottom Sheet */}
//             <CustomBottomSheet
//                 ref={bottomSheetRef}
//                 snapPoints={['45%', '85%']}
//                 initialSnapIndex={0}
//                 enablePanDownToClose={false}
//                 backdropOpacity={0}
//                 containerStyle={styles.bottomSheetContainer}
//                 handleIndicatorStyle={styles.handleIndicator}
//             >
//                 <ScrollView
//                     style={styles.sheetContent}
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {/* Delivery Partner Card */}
//                     {currentState === 'tracking' && (
//                         <View style={styles.partnerCard}>
//                             <Image source={{ uri: rider.photo }} style={styles.partnerPhoto} />
//                             <View style={styles.partnerInfo}>
//                                 <Text style={styles.partnerName}>{rider.name}</Text>
//                                 <Text style={styles.partnerVehicle}>
//                                     {rider.vehicle} • {rider.vehicleNumber}
//                                 </Text>
//                                 <View style={styles.partnerRating}>
//                                     <Ionicons name="star" size={14} color="#FFD700" />
//                                     <Text style={styles.ratingText}>
//                                         {rider.rating} ({rider.deliveries} deliveries)
//                                     </Text>
//                                 </View>
//                             </View>
//                             <View style={styles.partnerActions}>
//                                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}>
//                                     <Ionicons name="call" size={18} color={COLORS.white} />
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}>
//                                     <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.white} />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     )}

//                     {/* Order Progress */}
//                     <View style={styles.progressCard}>
//                         <Text style={styles.cardTitle}>Order Progress</Text>
//                         <View style={styles.progressSteps}>
//                             {steps.map((step, index) => {
//                                 const isCompleted = step.status === 'completed';
//                                 const isActive = step.status === 'active';
//                                 const isLast = index === steps.length - 1;

//                                 return (
//                                     <View key={step.id}>
//                                         <View style={styles.stepRow}>
//                                             <View style={styles.stepLeft}>
//                                                 <View
//                                                     style={[
//                                                         styles.stepCircle,
//                                                         isCompleted && styles.stepCompleted,
//                                                         isActive && styles.stepActive,
//                                                     ]}
//                                                 >
//                                                     {isCompleted ? (
//                                                         <Ionicons name="checkmark" size={16} color={COLORS.white} />
//                                                     ) : (
//                                                         <View style={styles.stepDot} />
//                                                     )}
//                                                 </View>
//                                                 {!isLast && (
//                                                     <View
//                                                         style={[
//                                                             styles.stepLine,
//                                                             isCompleted && styles.stepLineCompleted,
//                                                         ]}
//                                                     />
//                                                 )}
//                                             </View>
//                                             <View style={styles.stepContent}>
//                                                 <Text style={[
//                                                     styles.stepTitle,
//                                                     (isActive || isCompleted) && styles.stepTitleActive
//                                                 ]}>
//                                                     {step.title}
//                                                 </Text>
//                                                 <Text style={styles.stepTime}>{step.time}</Text>
//                                             </View>
//                                         </View>
//                                     </View>
//                                 );
//                             })}
//                         </View>
//                     </View>

//                     {/* Order Details */}
//                     <View style={styles.detailsCard}>
//                         <Text style={styles.cardTitle}>Order Details</Text>

//                         <View style={styles.restaurantInfo}>
//                             <View style={styles.restaurantIcon}>
//                                 <Ionicons name="restaurant" size={20} color={COLORS.primary} />
//                             </View>
//                             <View style={styles.restaurantDetails}>
//                                 <Text style={styles.restaurantName}>{order.restaurant}</Text>
//                                 <Text style={styles.restaurantLocation}>{order.location}</Text>
//                             </View>
//                         </View>

//                         <View style={styles.divider} />

//                         <View style={styles.itemsList}>
//                             {order.items.map((item, index) => (
//                                 <View key={index} style={styles.itemRow}>
//                                     <View style={styles.itemLeft}>
//                                         <View style={styles.itemBullet} />
//                                         <Text style={styles.itemName}>{item.name}</Text>
//                                     </View>
//                                     <Text style={styles.itemPrice}>{item.price}</Text>
//                                 </View>
//                             ))}
//                         </View>

//                         <View style={styles.divider} />

//                         <View style={styles.orderSummary}>
//                             <View style={styles.summaryRow}>
//                                 <Text style={styles.summaryLabel}>Total Amount</Text>
//                                 <Text style={styles.summaryValue}>{order.total}</Text>
//                             </View>
//                             <View style={styles.summaryRow}>
//                                 <Text style={styles.summaryLabel}>Payment Method</Text>
//                                 <View style={styles.paymentBadge}>
//                                     <Text style={styles.paymentText}>{order.payment}</Text>
//                                 </View>
//                             </View>
//                         </View>
//                     </View>

//                     {/* Actions */}
//                     <View style={styles.actionsCard}>
//                         <TouchableOpacity style={styles.actionItem}>
//                             <View style={styles.actionIconWrapper}>
//                                 <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
//                             </View>
//                             <Text style={styles.actionText}>Chat with Support</Text>
//                             <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
//                         </TouchableOpacity>

//                         <TouchableOpacity style={styles.actionItem}>
//                             <View style={styles.actionIconWrapper}>
//                                 <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
//                             </View>
//                             <Text style={styles.actionText}>View Invoice</Text>
//                             <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
//                         </TouchableOpacity>

//                         {currentState === 'preparing' && (
//                             <TouchableOpacity style={styles.actionItem}>
//                                 <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.secondary }]}>
//                                     <Ionicons name="close-circle-outline" size={20} color={COLORS.accent} />
//                                 </View>
//                                 <Text style={[styles.actionText, { color: COLORS.accent }]}>Cancel Order</Text>
//                                 <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     <View style={{ height: 40 }} />
//                 </ScrollView>
//             </CustomBottomSheet>

//             {/* Demo State Switcher */}
//             <TouchableOpacity
//                 style={styles.demoButton}
//                 onPress={() => {
//                     if (currentState === 'preparing') {
//                         setCurrentState('tracking');
//                         bottomSheetRef.current?.snapToIndex(0);
//                     } else if (currentState === 'tracking') {
//                         setCurrentState('delivered');
//                     } else {
//                         setCurrentState('preparing');
//                     }
//                 }}
//             >
//                 <Text style={styles.demoButtonText}>
//                     {currentState === 'preparing' ? '→ Tracking' : currentState === 'tracking' ? '→ Delivered' : '→ Preparing'}
//                 </Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// export default OrderTrackingScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     map: {
//         width: SCREEN_WIDTH,
//         height: SCREEN_HEIGHT * 0.55,
//     },
//     markerContainer: {
//         width: 46,
//         height: 46,
//         borderRadius: 23,
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 6,
//     },
//     riderMarkerContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     riderPulse: {
//         position: 'absolute',
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         backgroundColor: COLORS.primary,
//         opacity: 0.3,
//     },
//     riderMarker: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: COLORS.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 4,
//         borderColor: COLORS.white,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 6,
//     },
//     topHeader: {
//         position: 'absolute',
//         top: 50,
//         left: 16,
//         right: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 12,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 1,
//         shadowRadius: 12,
//         elevation: 8,
//     },
//     headerButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: COLORS.background,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerCenter: {
//         flex: 1,
//         alignItems: 'center',
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: COLORS.textPrimary,
//     },
//     headerSubtitle: {
//         fontSize: 12,
//         color: COLORS.textSecondary,
//         marginTop: 2,
//     },
//     etaCard: {
//         position: 'absolute',
//         top: 120,
//         right: 16,
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 16,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 1,
//         shadowRadius: 12,
//         elevation: 8,
//     },
//     etaContent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     etaIconContainer: {
//         width: 44,
//         height: 44,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     etaTextContainer: {
//         alignItems: 'flex-start',
//     },
//     etaTime: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: COLORS.textPrimary,
//     },
//     etaLabel: {
//         fontSize: 11,
//         color: COLORS.textSecondary,
//         marginTop: 2,
//     },
//     statusBanner: {
//         position: 'absolute',
//         top: SCREEN_HEIGHT * 0.50,
//         left: 16,
//         right: 16,
//         backgroundColor: COLORS.white,
//         borderRadius: 12,
//         padding: 14,
//         flexDirection: 'row',
//         alignItems: 'center',
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 1,
//         shadowRadius: 12,
//         elevation: 6,
//     },
//     statusDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         marginRight: 10,
//     },
//     statusText: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: COLORS.textPrimary,
//         flex: 1,
//     },
//     statusEmoji: {
//         fontSize: 16,
//     },
//     bottomSheetContainer: {
//         backgroundColor: COLORS.background,
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//     },
//     handleIndicator: {
//         backgroundColor: COLORS.border,
//         width: 40,
//         height: 4,
//     },
//     sheetContent: {
//         flex: 1,
//         paddingHorizontal: 16,
//     },
//     partnerCard: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 16,
//         marginTop: 8,
//         marginBottom: 16,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     partnerPhoto: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         marginRight: 12,
//     },
//     partnerInfo: {
//         flex: 1,
//     },
//     partnerName: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.textPrimary,
//         marginBottom: 2,
//     },
//     partnerVehicle: {
//         fontSize: 13,
//         color: COLORS.textSecondary,
//         marginBottom: 4,
//     },
//     partnerRating: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     ratingText: {
//         fontSize: 12,
//         color: COLORS.textSecondary,
//         marginLeft: 4,
//     },
//     partnerActions: {
//         gap: 8,
//     },
//     actionBtn: {
//         width: 38,
//         height: 38,
//         borderRadius: 19,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     progressCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 16,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     cardTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: COLORS.textPrimary,
//         marginBottom: 16,
//     },
//     progressSteps: {
//         gap: 0,
//     },
//     stepRow: {
//         flexDirection: 'row',
//         paddingBottom: 20,
//     },
//     stepLeft: {
//         alignItems: 'center',
//         marginRight: 16,
//     },
//     stepCircle: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         backgroundColor: COLORS.background,
//         borderWidth: 2,
//         borderColor: COLORS.border,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     stepCompleted: {
//         backgroundColor: COLORS.success,
//         borderColor: COLORS.success,
//     },
//     stepActive: {
//         backgroundColor: COLORS.primary,
//         borderColor: COLORS.primary,
//     },
//     stepDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: COLORS.muted,
//     },
//     stepLine: {
//         width: 2,
//         flex: 1,
//         backgroundColor: COLORS.border,
//         marginTop: 4,
//     },
//     stepLineCompleted: {
//         backgroundColor: COLORS.success,
//     },
//     stepContent: {
//         flex: 1,
//         paddingTop: 4,
//     },
//     stepTitle: {
//         fontSize: 15,
//         color: COLORS.textSecondary,
//         marginBottom: 2,
//     },
//     stepTitleActive: {
//         fontWeight: '600',
//         color: COLORS.textPrimary,
//     },
//     stepTime: {
//         fontSize: 12,
//         color: COLORS.muted,
//     },
//     detailsCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 16,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     restaurantInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     restaurantIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 12,
//         backgroundColor: COLORS.primaryLight + '20',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     restaurantDetails: {
//         flex: 1,
//     },
//     restaurantName: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: COLORS.textPrimary,
//         marginBottom: 2,
//     },
//     restaurantLocation: {
//         fontSize: 13,
//         color: COLORS.textSecondary,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: COLORS.border,
//         marginVertical: 16,
//     },
//     itemsList: {
//         gap: 12,
//     },
//     itemRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     itemLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     itemBullet: {
//         width: 6,
//         height: 6,
//         borderRadius: 3,
//         backgroundColor: COLORS.primary,
//         marginRight: 10,
//     },
//     itemName: {
//         fontSize: 15,
//         color: COLORS.textPrimary,
//     },
//     itemPrice: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: COLORS.textPrimary,
//     },
//     orderSummary: {
//         gap: 12,
//     },
//     summaryRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     summaryLabel: {
//         fontSize: 14,
//         color: COLORS.textSecondary,
//     },
//     summaryValue: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.textPrimary,
//     },
//     paymentBadge: {
//         backgroundColor: COLORS.primaryLight + '20',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 8,
//     },
//     paymentText: {
//         fontSize: 13,
//         fontWeight: '600',
//         color: COLORS.primary,
//     },
//     actionsCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         padding: 12,
//         marginBottom: 16,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     actionItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 14,
//         paddingHorizontal: 8,
//     },
//     actionIconWrapper: {
//         width: 36,
//         height: 36,
//         borderRadius: 10,
//         backgroundColor: COLORS.primaryLight + '20',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     actionText: {
//         flex: 1,
//         fontSize: 15,
//         fontWeight: '500',
//         color: COLORS.textPrimary,
//     },
//     deliveredContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 24,
//     },
//     successContainer: {
//         alignItems: 'center',
//         width: '100%',
//         maxWidth: 400,
//     },
//     successIconContainer: {
//         position: 'relative',
//         marginBottom: 24,
//     },
//     successRing: {
//         position: 'absolute',
//         width: 130,
//         height: 130,
//         borderRadius: 65,
//         borderWidth: 3,
//         borderColor: COLORS.white,
//         opacity: 0.3,
//         top: -15,
//         left: -15,
//     },
//     successTitle: {
//         fontSize: 28,
//         fontWeight: '700',
//         color: COLORS.white,
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     successSubtitle: {
//         fontSize: 15,
//         color: COLORS.white,
//         opacity: 0.9,
//         textAlign: 'center',
//         marginBottom: 32,
//         paddingHorizontal: 20,
//     },
//     deliveredDetails: {
//         width: '100%',
//         backgroundColor: 'rgba(255, 255, 255, 0.15)',
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 24,
//     },
//     deliveredRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 12,
//     },
//     deliveredLabel: {
//         fontSize: 14,
//         color: COLORS.white,
//         opacity: 0.8,
//     },
//     deliveredValue: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.white,
//     },
//     feedbackButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.white,
//         paddingVertical: 16,
//         paddingHorizontal: 32,
//         borderRadius: 14,
//         width: '100%',
//         justifyContent: 'center',
//         marginBottom: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 8,
//         elevation: 6,
//     },
//     feedbackButtonText: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.primary,
//         marginLeft: 8,
//     },
//     secondaryButton: {
//         paddingVertical: 14,
//         paddingHorizontal: 32,
//         borderRadius: 14,
//         width: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: COLORS.white,
//     },
//     secondaryButtonText: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: COLORS.white,
//     },
//     demoButton: {
//         position: 'absolute',
//         bottom: 30,
//         alignSelf: 'center',
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 24,
//         shadowColor: COLORS.shadow,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 1,
//         shadowRadius: 12,
//         elevation: 8,
//     },
//     demoButtonText: {
//         color: COLORS.white,
//         fontSize: 14,
//         fontWeight: '700',
//     },
// });