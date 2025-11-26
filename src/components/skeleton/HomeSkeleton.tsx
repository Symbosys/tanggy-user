import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';

const { width } = Dimensions.get('window');

const MAIN_CIRCLE_SIZE = 120;
const ICON_BG_SIZE = 45;
const RADIUS = MAIN_CIRCLE_SIZE / 2;

export default function TrinityLoader({ title = "Loading...", subtitle = "" }: { title?: string, subtitle?: string }) {
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
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
    }, []);

    const spinMain = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spinReverse = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'],
    });

    const getPos = (angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = RADIUS + (RADIUS * Math.cos(angleRad)) - (ICON_BG_SIZE / 2);
        const y = RADIUS + (RADIUS * Math.sin(angleRad)) - (ICON_BG_SIZE / 2);

        return { left: x, top: y };
    };

    return (
        <View style={styles.container}>
            <View style={styles.loaderContainer}>

                <Animated.View style={[styles.centerPiece, { transform: [{ scale: pulseValue }] }]}>
                    <Icon name="chef-hat" size={40} color={COLORS.primary} />
                </Animated.View>
                <Animated.View style={[styles.orbitRing, { transform: [{ rotate: spinMain }] }]}>

                    <View style={[styles.orbitItem, getPos(-90)]}>
                        <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                            <Icon name="food-drumstick" size={24} color="#FFF" />
                        </Animated.View>
                    </View>

                    <View style={[styles.orbitItem, getPos(30)]}>
                        <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                            <Icon name="fish" size={24} color="#FFF" />
                        </Animated.View>
                    </View>

                        <View style={[styles.orbitItem, getPos(150)]}>
                        <Animated.View style={{ transform: [{ rotate: spinReverse }] }}>
                            <Icon name="food-steak" size={24} color="#FFF" />
                        </Animated.View>
                    </View>

                </Animated.View>
            </View>

            <View style={styles.textWrapper}>
                <Text style={styles.loadingTitle}>{title}</Text>
                <Text style={styles.loadingSubtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#FFF',
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
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: MAIN_CIRCLE_SIZE / 2,
        // No justifyContent/alignItems here because we use absolute positioning for children
    },
    orbitItem: {
        position: 'absolute',
        width: ICON_BG_SIZE,
        height: ICON_BG_SIZE,
        borderRadius: ICON_BG_SIZE / 2,
        backgroundColor: COLORS.primary || '#FF5733',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
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
        zIndex: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee'
    },
    textWrapper: {
        marginTop: 50,
        alignItems: 'center',
    },
    loadingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary || '#333',
        marginBottom: 5,
    },
    loadingSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});