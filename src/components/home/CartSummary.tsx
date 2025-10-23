import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../../store/cart';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';


const CartSummary = ({ navigation }: AppNavigation) => {

  const totalCartItems = useCartStore(state => state.totalItems);
  const subTotal = useCartStore(state => state.subtotal);

  console.log("🚀 ~ file: CartSummary.tsx ~ line 19 ~ CartSummary ~ totalCartItems", totalCartItems)
  console.log("🚀 ~ file: CartSummary.tsx ~ line 20 ~ CartSummary ~ subTotal", subTotal)

  
  return (
    <View style={styles.container}>
      <View style={styles.cartSummary}>
        <View style={styles.cartLeft}>
          <Text style={styles.cartItemCount}>{totalCartItems} Item</Text>
          <Text style={styles.cartSeparator}>|</Text>
          <Text style={styles.cartTotal}>
            ₹{parseToDecimal(subTotal).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewCartButton}
          onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    marginBottom: 40,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemCount: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  cartSeparator: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  cartTotal: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewCartButton: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
});

export default CartSummary;
