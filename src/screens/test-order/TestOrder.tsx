import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PhonePePaymentSDK from 'react-native-phonepe-pg';

// ==================== CONFIGURATION ====================

const ENVIRONMENT = 'SANDBOX'; // Change to "PRODUCTION" when live
const MERCHANT_ID = 'M23WDWBKJVZNR'; // Your PhonePe Merchant ID
const FLOW_ID = 'flow_minta_fresh_001'; // Any unique flow ID
const ENABLE_LOGGING = false; // Set to false in production

const BACKEND_BASE_URL = 'http://192.168.1.8:4000/api/v1/minta-fresh'; // Change this for production
const CALLBACK_URL = 'mintafresh://'; // Your app's deep link

const PAYMENT_AMOUNT = 250; // Amount in paise (₹100)
const USER_ID = 'user_123'; // Default user ID (can be dynamic later)

// =======================================================

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);

  // Initialize PhonePe SDK
  useEffect(() => {
    PhonePePaymentSDK.init(ENVIRONMENT, MERCHANT_ID, FLOW_ID, ENABLE_LOGGING)
      .then(() => console.log('✅ PhonePe SDK Initialized'))
      .catch(err => console.error('❌ SDK Init Failed:', err));
  }, []);

  const handlePay = async () => {
    setLoading(true);

    try {
      // 1. Call Backend to Create Order
      const response = await fetch(
        `${BACKEND_BASE_URL}/order/phonepe/create-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: PAYMENT_AMOUNT,
            userId: USER_ID,
          }),
        },
      );

      const result = await response.json();
      const paymentData = result.data;

      console.log({ paymentData });

      if (!result.success || !paymentData || !paymentData.token) {
        throw new Error(result.message || 'Failed to get payment token');
      }

      // 2. Prepare payload for SDK
      // We use the token and merchantOrderId returned by the backend
      const payload = {
        merchantId: MERCHANT_ID, // Use the constant defined above
        orderId: paymentData.merchantOrderId,
        token: paymentData.token,
        paymentMode: {
          type: 'PAY_PAGE',
        },
      };

      console.log({ payload });

      const requestBody = JSON.stringify(payload);

      // 3. Start PhonePe Payment
      const sdkResult = await PhonePePaymentSDK.startTransaction(
        requestBody,
        null,
      );

      console.log('Payment Result:', sdkResult);

      // 4. Check final status from backend (Recommended)
      if (sdkResult?.status === 'SUCCESS') {
        checkPaymentStatus(paymentData.merchantOrderId);
      } else if (sdkResult?.status === 'FAILED') {
        Alert.alert('Payment Failed');
      } else if (sdkResult?.status === 'CANCELLED') {
        Alert.alert('Payment Cancelled');
      }
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (merchantOrderId: string) => {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/order/phonepe/verify-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantOrderId }),
        },
      );

      const status = await res.json();
      Alert.alert('Payment Status', JSON.stringify(status, null, 2));
    } catch (err) {
      console.error('Status Check Failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minta Fresh</Text>
      <Text style={styles.subtitle}>Pay ₹100 using PhonePe</Text>

      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay ₹100 with PhonePe</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.payButton, { marginTop: 20, backgroundColor: '#9235D0' }]}
        onPress={() => Linking.openURL('mintafresh://about')}
      >
        <Text style={styles.buttonText}>Redirect to About</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  payButton: {
    backgroundColor: '#5C2D91',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PaymentScreen;
