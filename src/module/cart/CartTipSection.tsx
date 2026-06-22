import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartUIStore } from './store';

export const CartTipSection: React.FC = () => {
    const { selectedTip, setSelectedTip, toggleTip } = useCartUIStore();
    const [showCustomInput, setShowCustomInput] = useState(
        selectedTip !== null && ![10, 20, 30].includes(selectedTip)
    );
    const [customValue, setCustomValue] = useState(
        selectedTip !== null && ![10, 20, 30].includes(selectedTip) ? String(selectedTip) : ''
    );

    useEffect(() => {
        if (selectedTip !== null && ![10, 20, 30].includes(selectedTip)) {
            setShowCustomInput(true);
            setCustomValue(String(selectedTip));
        } else if (selectedTip === null) {
            setShowCustomInput(false);
            setCustomValue('');
        }
    }, [selectedTip]);

    const handleTipSelect = (tip: number) => {
        setShowCustomInput(false);
        toggleTip(tip);
    };

    return (
        <View style={styles.tipSection}>
            <LinearGradient
                colors={[`${COLORS.secondary}20`, COLORS.white]}
                style={styles.tipCard}
            >
                <Text style={styles.tipTitle}>Tip your delivery partner</Text>
                <Text style={styles.tipDesc}>100% of the tip goes to your delivery partner.</Text>
                <View style={styles.tipButtons}>
                    {[10, 20, 30].map((tip) => (
                        <TouchableOpacity
                            key={tip}
                            style={[
                                styles.tipButtonUnselected,
                                selectedTip === tip && !showCustomInput && styles.tipButtonSelected,
                            ]}
                            onPress={() => handleTipSelect(tip)}
                        >
                            <Text style={[styles.tipButtonText, selectedTip === tip && !showCustomInput && styles.tipButtonSelectedText]}>
                                ₹{tip}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {!showCustomInput ? (
                        <TouchableOpacity
                            style={[
                                styles.tipButtonUnselected,
                                (selectedTip !== null && ![10, 20, 30].includes(selectedTip)) && styles.tipButtonSelected,
                            ]}
                            onPress={() => {
                                setShowCustomInput(true);
                                setSelectedTip(null);
                                setCustomValue('');
                            }}
                        >
                            <Text style={[
                                styles.tipButtonText,
                                (selectedTip !== null && ![10, 20, 30].includes(selectedTip)) && styles.tipButtonSelectedText
                            ]}>
                                {selectedTip !== null && ![10, 20, 30].includes(selectedTip) ? `₹${selectedTip}` : 'Custom'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TextInput
                                style={{
                                    height: 36,
                                    borderWidth: 1,
                                    borderColor: COLORS.primary,
                                    backgroundColor: COLORS.white,
                                    borderRadius: 9999,
                                    paddingHorizontal: 16,
                                    color: COLORS.textPrimary,
                                    fontWeight: '800',
                                    fontSize: 14,
                                    width: 120,
                                }}
                                placeholder="₹ Enter tip"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="numeric"
                                value={customValue}
                                autoFocus
                                onChangeText={(text) => {
                                    const val = text.replace(/[^0-9]/g, '');
                                    setCustomValue(val);
                                    const num = parseInt(val, 10);
                                    setSelectedTip(isNaN(num) ? null : num);
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: '#f3f4f6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    setShowCustomInput(false);
                                    setSelectedTip(null);
                                    setCustomValue('');
                                }}
                            >
                                <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 16 }}>×</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

