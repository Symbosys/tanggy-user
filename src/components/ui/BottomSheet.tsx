import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    GestureResponderEvent,
    PanResponderGestureState,
    Platform,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CustomBottomSheetProps {
    snapPoints?: (string | number)[];
    initialSnapIndex?: number;
    enablePanDownToClose?: boolean;
    backdropComponent?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
    containerStyle?: any;
    handleStyle?: any;
    handleIndicatorStyle?: any;
    backdropOpacity?: number;
    animationDuration?: number;
    keyboardBehavior?: 'interactive' | 'fillParent' | 'none';
}

interface BottomSheetRef {
    open: (snapIndex?: number) => void;
    close: () => void;
    snapToIndex: (index: number) => void;
    expand: () => void;
    collapse: () => void;
}

const CustomBottomSheet = forwardRef<BottomSheetRef, CustomBottomSheetProps>(
    ({
        snapPoints = ['20%', '50%', '80%'],
        initialSnapIndex = 1,
        enablePanDownToClose = true,
        backdropComponent = true,
        onClose,
        children,
        containerStyle,
        handleStyle,
        handleIndicatorStyle,
        backdropOpacity = 0.5,
        animationDuration = 300,
        keyboardBehavior = 'interactive' as const,
    }, ref) => {
        const [currentSnapIndex, setCurrentSnapIndex] = useState<number>(initialSnapIndex);
        const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

        const translateY = useRef<Animated.Value>(new Animated.Value(0)).current; // Initial at 0 for always visible
        const lastGestureDy = useRef<number>(0);

        // Convert snap points to actual heights (from bottom)
        const getSnapPointHeight = (point: string | number): number => {
            if (typeof point === 'string' && point.includes('%')) {
                return SCREEN_HEIGHT * (parseFloat(point) / 100);
            }
            return point as number;
        };

        const snapPointHeights: number[] = snapPoints.map(point => SCREEN_HEIGHT - getSnapPointHeight(point));

        // Keyboard listeners
        useEffect(() => {
            const showListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
                (e: any) => {
                    setKeyboardHeight(e.endCoordinates.height);
                    if (keyboardBehavior === 'interactive') {
                        Animated.timing(translateY, {
                            toValue: snapPointHeights[snapPointHeights.length - 1] - e.endCoordinates.height,
                            duration: e.duration || 250,
                            useNativeDriver: true,
                        }).start();
                    }
                }
            );

            const hideListener = Keyboard.addListener(
                Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
                (e: any) => {
                    setKeyboardHeight(0);
                    if (keyboardBehavior === 'interactive') {
                        snapToIndex(currentSnapIndex);
                    }
                }
            );

            return () => {
                showListener?.remove();
                hideListener?.remove();
            };
        }, [currentSnapIndex, keyboardBehavior, snapPointHeights]);

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                    return Math.abs(gestureState.dy) > 5;
                },
                onPanResponderGrant: () => {
                    translateY.setOffset(lastGestureDy.current);
                    translateY.setValue(0);
                },
                onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                    if (gestureState.dy > 0 || currentSnapIndex < snapPointHeights.length - 1) {
                        translateY.setValue(gestureState.dy);
                    }
                },
                onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                    translateY.flattenOffset();
                    const currentValue = lastGestureDy.current + gestureState.dy;

                    // Close if dragged down significantly
                    if (enablePanDownToClose && gestureState.dy > 100 && gestureState.vy > 0.5) {
                        close();
                        return;
                    }

                    // Find nearest snap point
                    let nearestSnapIndex = 0;
                    let minDistance = Math.abs(currentValue - snapPointHeights[0]);

                    snapPointHeights.forEach((height, index) => {
                        const distance = Math.abs(currentValue - height);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestSnapIndex = index;
                        }
                    });

                    // Consider velocity
                    if (Math.abs(gestureState.vy) > 0.5) {
                        if (gestureState.vy > 0 && nearestSnapIndex > 0) {
                            nearestSnapIndex--;
                        } else if (gestureState.vy < 0 && nearestSnapIndex < snapPointHeights.length - 1) {
                            nearestSnapIndex++;
                        }
                    }

                    snapToIndex(nearestSnapIndex);
                },
            })
        ).current;

        const snapToIndex = (index: number) => {
            const clampedIndex = Math.max(0, Math.min(index, snapPointHeights.length - 1));
            setCurrentSnapIndex(clampedIndex);

            Animated.spring(translateY, {
                toValue: snapPointHeights[clampedIndex],
                useNativeDriver: true,
                damping: 20,
                stiffness: 150,
            }).start(() => {
                lastGestureDy.current = snapPointHeights[clampedIndex];
            });
        };

        const open = (snapIndex: number = initialSnapIndex) => {
            snapToIndex(snapIndex);
        };

        const close = () => {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: animationDuration,
                useNativeDriver: true,
            }).start(() => {
                lastGestureDy.current = SCREEN_HEIGHT;
                onClose?.();
            });
        };

        const expand = () => {
            snapToIndex(snapPointHeights.length - 1);
        };

        const collapse = () => {
            snapToIndex(0);
        };

        // Initial position
        useEffect(() => {
            open(initialSnapIndex);
        }, []);

        useImperativeHandle(ref, () => ({
            open,
            close,
            snapToIndex,
            expand,
            collapse,
        }));

        return (
            <View style={styles.overlay}>
                {backdropComponent && (
                    <TouchableWithoutFeedback onPress={close}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                )}

                <Animated.View
                    style={[
                        styles.container,
                        containerStyle,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View {...panResponder.panHandlers} style={[styles.handle, handleStyle]}>
                        <View style={[styles.handleIndicator, handleIndicatorStyle]} />
                    </View>

                    <View style={styles.content}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent if needed, but set to false in props for no block
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    handle: {
        height: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handleIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
    },
    content: {
        flex: 1,
    },
});

export default CustomBottomSheet;