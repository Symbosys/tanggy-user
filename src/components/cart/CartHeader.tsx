import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { cartStyles as styles } from './styles';
import { useCartStore } from '../../store/cart';
import { useCartActions } from './hooks';

interface Props {
    onBack: () => void;
}

export const CartHeader: React.FC<Props> = ({ onBack }) => {
    const { cartItems } = useCartStore();
    const { handleClearCart } = useCartActions();

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
                <Text style={styles.headerTitle}>My Cart</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity style={styles.iconButton} onPress={handleClearCart}>
                        <MaterialIcons name="delete-sweep" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
