import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Modal, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';

// Configuration
const MAIN_CIRCLE_SIZE = 120;
const ICON_BG_SIZE = 45;

const OverlayLoader = ({ visible, title="Loading...", subtitle="" }: { visible: boolean, title?: string, subtitle?: string }) => {
    // Animation Values
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Start animations only when visible
            spinValue.setValue(0);
            pulseValue.setValue(1);

            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseValue, {
                        toValue: 1.1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseValue, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);

    const spinMain = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spinReverse = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'],
    });

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={() => { }} // Block back button on Android
        >
            <View style={styles.overlayBackground}>
                {/* Optional: Darken status bar when loading */}
                <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />

                <View style={styles.loaderContainer}>

                    {/* Center Piece (White circle with Chef Hat) */}
                    <Animated.View style={[styles.centerPiece, { transform: [{ scale: pulseValue }] }]}>
                        <Icon name="chef-hat" size={40} color={COLORS.primary} />
                    </Animated.View>

                    {/* Orbit Ring */}
                    <Animated.View style={[styles.orbitRing, { transform: [{ rotate: spinMain }] }]}>

                        {/* 1. Chicken */}
                        <View style={[styles.orbitItem, { top: -ICON_BG_SIZE / 2 }]}>
                            <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                                <Icon name="food-drumstick" size={24} color="#FFF" />
                            </Animated.View>
                        </View>

                        {/* 2. Fish */}
                        <View style={[styles.orbitItem, { bottom: 10, right: 0 }]}>
                            <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                                <Icon name="fish" size={24} color="#FFF" />
                            </Animated.View>
                        </View>

                        {/* 3. Meat */}
                        <View style={[styles.orbitItem, { bottom: 10, left: 0 }]}>
                            <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                                <Icon name="food-steak" size={24} color="#FFF" />
                            </Animated.View>
                        </View>

                    </Animated.View>
                </View>

                {/* Text is now White to contrast with dark overlay */}
                <View style={styles.textWrapper}>
                    <Text style={styles.loadingTitle}>{title}</Text>
                    <Text style={styles.loadingSubtitle}>{subtitle}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // The semi-transparent background
    overlayBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // 75% opacity black
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        width: MAIN_CIRCLE_SIZE + 60,
        height: MAIN_CIRCLE_SIZE + 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbitRing: {
        width: MAIN_CIRCLE_SIZE,
        height: MAIN_CIRCLE_SIZE,
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', // Very faint white ring
        borderRadius: MAIN_CIRCLE_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbitItem: {
        position: 'absolute',
        width: ICON_BG_SIZE,
        height: ICON_BG_SIZE,
        borderRadius: ICON_BG_SIZE / 2,
        backgroundColor: COLORS.primary, // Your brand color
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    centerPiece: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },
    textWrapper: {
        marginTop: 60,
        alignItems: 'center',
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF', // White text
        marginBottom: 8,
    },
    loadingSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#CCC', // Light gray text
        letterSpacing: 1,
    }
});

export default OverlayLoader;