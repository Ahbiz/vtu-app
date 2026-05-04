import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import apiClient from '../utils/api';

/**
 * [WHAT] - This is a Reusable Payment Button.
 * [WHY] - It handles the entire "Start Payment" flow so you can use it anywhere in the app.
 * [HOW] - It calls our backend to get an 'access_code' and then opens the Paystack checkout.
 */

interface PaymentButtonProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, email, onSuccess, onCancel }) => {
  // [WHAT] - We use the 'usePaystack' hook from the library.
  // [WHY] - This gives us the 'startTransaction' function which opens the payment screen.
  const { startTransaction } = usePaystack();
  const [loading, setLoading] = React.useState(false);

  const handlePayPress = async () => {
    try {
      setLoading(true);

      /**
       * STEP 1: Tell our backend we want to start a payment.
       * [WHY] - Our backend needs to record this attempt and get a secure 'access_code' from Paystack.
       * [HOW] - We use our Axios 'apiClient' to call the '/paystack/initialize' route.
       */
      const response = await apiClient.post('/paystack/initialize', {
        email,
        amount,
      });

      const { access_code } = response.data;

      setLoading(false);

      /**
       * STEP 2: Open the Paystack Payment Screen.
       * [WHY] - To show the user the secure UI where they can enter their card or use USSD.
       * [HOW] - we call 'startTransaction' with the 'access_code' we just got.
       */
      startTransaction({
        accessCode: access_code,
        onSuccess: (res: any) => {
          // [TERM] - Reference: The unique ID for this specific payment.
          onSuccess(res.reference);
        },
        onCancel: () => {
          onCancel();
        },
      });

    } catch (error: any) {
      setLoading(false);
      console.error('Payment Initialization Error:', error);
      Alert.alert('Error', 'Could not start payment. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handlePayPress} 
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.text}>Fund Wallet (₦{amount})</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366FF', // Ahbiz Brand Color
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentButton;
