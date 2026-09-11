import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';

import { useModeStore } from '../../store/mode';

interface Props {
    onBack: () => void;
}

export const CartHeader: React.FC<Props> = ({ onBack }) => {
    const selectedMode = useModeStore((s) => s.selectedMode);

    return (
        <View style={styles.header}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.headerGradient}
            />
            <View style={styles.headerContent}>
                <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    {selectedMode?.name ? (
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                            {selectedMode.name}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.iconButton} />
            </View>
        </View>
    );
};
