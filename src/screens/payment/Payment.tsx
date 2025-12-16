import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Use lucide-react-native if you have it installed, or any icon library
// import { Wallet } from 'lucide-react-native'; 

const PaymentButton = ({ totalAmount = "10" }) => {
    // CONFIGURATION
    const upiId = "amitkumardss2892@okaxis"; // Replace with your VPA
    const payeeName = "Fresh";        // Replace with your Name
    const note = "Fresh Order Payment";

    const handlePayment = async () => {
        // 1. Construct the URL (Same as Web)
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

        try {
            // 2. Check if the device can handle this link
            // (This checks if any UPI app is installed)
            const supported = await Linking.canOpenURL(upiUrl);

            if (supported) {
                // 3. Open the App Chooser
                await Linking.openURL(upiUrl);
            } else {
                Alert.alert("Error", "No UPI apps found on this phone (PhonePe, GPay, etc).");
            }
        } catch (err) {
            console.error('An error occurred', err);
            Alert.alert("Error", "Could not open payment app.");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePayment}
            >
                {/* Replace Text with <Wallet /> icon if you have icons configured */}
                <Text style={styles.text}>Pay ₹{totalAmount}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        right: 30,
        zIndex: 999,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#16a34a', // Green-600
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default PaymentButton;