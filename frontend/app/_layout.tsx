import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
/**
 * [WHAT] - We import PaystackProvider from the 'react-native-paystack-webview' package.
 * [WHY] - This provider allows our app to communicate with Paystack's payment interface.
 */
import { PaystackProvider } from 'react-native-paystack-webview';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaystackProvider 
      // [WHAT] - We provide our Public Key here.
      // [WHY] - This identifies your specific Paystack account.
      // [HOW] - We pull it from our .env file. If it's missing, we use a test key as a fallback.
      publicKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_d1a7f9fcce8968b854ec488480a9e446f560f4e4'}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(dashboard)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </PaystackProvider>
  );
}
