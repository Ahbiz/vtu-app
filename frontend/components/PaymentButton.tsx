import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import apiClient from '../utils/api';

interface PaymentButtonProps {
  amount: number;   // in Naira
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

/**
 * Initiates a Paystack checkout using react-native-paystack-webview v5.
 *
 * Flow:
 *  1. Call our backend to generate a server-side reference (prevents duplicate fulfillment).
 *  2. Open the Paystack WebView modal with that reference.
 *  3. Wallet credit happens via the charge.success webhook — not here.
 *
 * NOTE: This component must be rendered inside a <PaystackProvider publicKey="pk_..."> tree.
 * The library handles kobo conversion internally (amount * 100), so pass Naira here.
 */
const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, email, onSuccess, onCancel }) => {
  const { popup } = usePaystack();
  const [loading, setLoading] = React.useState(false);

  const handlePayPress = async () => {
    try {
      setLoading(true);

      // Get a server-generated reference so we can guard against double-fulfillment
      // in the webhook handler before the Paystack modal opens.
      const response = await apiClient.post('/paystack/initialize', { amount });
      const { reference } = response.data;

      setLoading(false);

      popup.checkout({
        email,
        amount,   // library multiplies by 100 internally
        reference,
        onSuccess: (res: any) => {
          onSuccess(res.reference);
        },
        onCancel: () => {
          onCancel();
        },
      });
    } catch (error: any) {
      setLoading(false);
      console.error('Payment initialization error:', error);
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
    backgroundColor: '#6366FF',
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
