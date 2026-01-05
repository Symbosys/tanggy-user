import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';

interface Props {
    onStartShopping: () => void;
}

export const CartEmptyState: React.FC<Props> = ({ onStartShopping }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Floating animation for the icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -15,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Pulse animation for the background circle
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [floatAnim, pulseAnim]);

    return (
        <View style={styles.emptyContent}>
            <View style={styles.emptyContainer}>
                {/* Animated Illustration Area */}
                <View style={styles.emptyIllustrationContainer}>
                    {/* Pulsing Background Circle */}
                    <Animated.View
                        style={[
                            styles.emptyCircleBackground,
                            { transform: [{ scale: pulseAnim }] },
                        ]}
                    />

                    {/* Decorative small circles */}
                    <Animated.View
                        style={[
                            styles.emptyDecoratorCircle1,
                            { transform: [{ translateY: Animated.multiply(floatAnim, 0.5) }] }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.emptyDecoratorCircle2,
                            { transform: [{ translateY: Animated.multiply(floatAnim, -0.7) }] }
                        ]}
                    />

                    {/* Floating Icon Container */}
                    <Animated.View
                        style={[
                            styles.emptyIconContainer,
                            { transform: [{ translateY: floatAnim }] },
                        ]}
                    >
                        <MaterialIcons name="add-shopping-cart" size={64} color={COLORS.primary} />
                    </Animated.View>
                </View>

                {/* Text Content */}
                <Text style={styles.emptyTitle}>Your Cart is Feeling Lonely</Text>
                <Text style={styles.emptySubtitle}>
                    Looks like you haven't added anything yet.
                    Discover our fresh products and fill it up!
                </Text>

                {/* Call to Action Button */}
                <TouchableOpacity
                    style={styles.startShoppingButton}
                    onPress={onStartShopping}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startShoppingGradient}
                    >
                        <Text style={styles.startShoppingText}>Start Shopping</Text>
                        <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};
