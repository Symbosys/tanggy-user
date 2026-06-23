import { AxiosError } from 'axios';
import { Alert, Linking, ToastAndroid } from 'react-native';

type DecimalObj = { s: number; e: number; d: number[] };

export function parseToDecimal(
  price: number | DecimalObj | null | undefined,
): number {
  if (!price) return 0;
  if (typeof price === 'number') return price;

  const high = price.d?.[0] ?? 0;
  const low = price.d?.[1] ?? 0;
  return (high + low / 1e7) * (price.s ?? 1);
}

/**
 * Calculates discount percentage based on market and selling price
 * @param marketPrice - Market price (number or DecimalObj)
 * @param sellingPrice - Selling price (number or DecimalObj)
 * @returns number - Discount percentage (rounded to nearest integer)
 */
export function calculateDiscount(
  marketPrice: number | DecimalObj | null | undefined,
  sellingPrice: number | DecimalObj | null | undefined,
): number {
  const market = parseToDecimal(marketPrice);
  const selling = parseToDecimal(sellingPrice);

  if (market <= 0) return 0; // avoid division by zero or invalid data
  const discount = ((market - selling) / market) * 100;

  return Math.round(discount); // round to nearest integer (e.g., 25%)
}

export const ErrorMessage = (error: AxiosError | Error) => {
  if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        ToastAndroid.show(serverMessage || error.message || "An unexpected server error occurred", ToastAndroid.LONG);
    } else if (error instanceof Error) {
        ToastAndroid.show(error.message || "Something went wrong", ToastAndroid.LONG);
    } else {
        ToastAndroid.show("An unknown error occurred", ToastAndroid.LONG);
    }
};

export const SuccessMessage = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
};

/**
 * Generates initials from a full name.
 * Takes the first letter of the first word and the first letter of the last word.
 * Example: "Amit Kumar" -> "AK", "John" -> "J"
 * @param name - The full name string
 * @returns string - The generated initials
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 0) return '';

  const firstInitial = words[0][0].toUpperCase();
  const lastInitial =
    words.length > 1 ? words[words.length - 1][0].toUpperCase() : '';

  return firstInitial + lastInitial;
};










const upiId = 'amitkumardss2892@okaxis'; // Replace with your VPA
const payeeName = 'Fresh'; // Replace with your Name
const note = 'Fresh Order Payment';

export const handlePayment = async (totalAmount: string): Promise<boolean> => {
  // 1. Construct the URL (Same as Web)
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName,
  )}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  try {
    // 2. Check if the device can handle this link
    // (This checks if any UPI app is installed)
    const supported = await Linking.canOpenURL(upiUrl);

    if (supported) {
      // 3. Open the App Chooser
      await Linking.openURL(upiUrl);
      return true;
    } else {
      Alert.alert(
        'Error',
        'No UPI apps found on this phone (PhonePe, GPay, etc).',
      );
      return false;
    }
  } catch (err) {
    console.error('An error occurred', err);
    Alert.alert('Error', 'Could not open payment app.');
    return false;
  }
};

export const parseWeightToGrams = (weightStr: string | number | null | undefined): number => {
  if (!weightStr) return 0;
  const str = String(weightStr).toLowerCase().trim();
  const match = str.match(/^([\d.]+)\s*(kg|g|kilogram|kilograms|gram|grams)?$/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
      return value * 1000;
    }
    return value;
  }
  const fallbackVal = parseFloat(str);
  if (isNaN(fallbackVal)) return 0;
  if (str.includes('kg') || str.includes('kilogram')) {
    return fallbackVal * 1000;
  }
  return fallbackVal;
};
