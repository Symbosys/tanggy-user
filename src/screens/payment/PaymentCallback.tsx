import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';
// import { CheckCircle, XCircle } from 'lucide-react-native'; 

const PaymentCallbackScreen = () => {
    const navigation = useNavigation<any>();
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await api.post('/payment/verify', { ... });
            console.log('Verifying payment...');

            // Simulate API delay
            setTimeout(() => {
                // Mock success
                setStatus('success');
                // Mock failure
                // setStatus('failed');
            }, 2000);
        } catch (error) {
            console.error('Payment verification failed:', error);
            setStatus('failed');
        }
    };

    const handleContinue = () => {
        // Navigate to Order Confirmation or Home
        navigation.navigate('OrderPlaced');
    };

    const handleRetry = () => {
        setStatus('verifying');
        verifyPayment();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {status === 'verifying' && (
                    <>
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text style={styles.title}>Verifying Payment</Text>
                        <Text style={styles.subtitle}>Please wait while we confirm your transaction...</Text>
                    </>
                )}

                {status === 'success' && (
                    <>
                        {/* <CheckCircle size={80} color="#16a34a" /> */}
                        <View style={[styles.iconPlaceholder, { backgroundColor: '#16a34a' }]} />
                        <Text style={styles.title}>Payment Successful!</Text>
                        <Text style={styles.subtitle}>Your payment has been processed successfully.</Text>

                        <TouchableOpacity style={styles.button} onPress={handleContinue}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        {/* <XCircle size={80} color="#dc2626" /> */}
                        <View style={[styles.iconPlaceholder, { backgroundColor: '#dc2626' }]} />
                        <Text style={styles.title}>Payment Failed</Text>
                        <Text style={styles.subtitle}>Something went wrong. Please try again.</Text>

                        <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={handleRetry}>
                            <Text style={styles.buttonText}>Retry</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#16a34a',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButton: {
        backgroundColor: '#dc2626',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PaymentCallbackScreen;