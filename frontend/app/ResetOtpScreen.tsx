import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimer } from 'react-timer-hook';
import apiClient from '../utils/api';

export default function ResetOtpScreen() {
    const router = useRouter();
    const { contact, type } = useLocalSearchParams();
    const contactStr = Array.isArray(contact) ? contact[0] : contact || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const time = new Date();
    time.setSeconds(time.getSeconds() + 45);
    const { seconds, restart } = useTimer({ expiryTimestamp: time });

    const maskedContact = contactStr
        ? contactStr.slice(0, -3).replace(/./g, '*') + contactStr.slice(-3)
        : '';

    const handleResend = async () => {
        try {
            await apiClient.post('/auth/forgot-password', { email: contactStr });
            const newTime = new Date();
            newTime.setSeconds(newTime.getSeconds() + 45);
            restart(newTime);
        } catch {
            Alert.alert("Error", "Could not resend code. Please try again.");
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 4) {
            Alert.alert("Validation Error", "Please enter a complete 4-digit code.");
            return;
        }

        // Pass contact and otp to CreateNewPasswordScreen to complete the reset
        router.push({
            pathname: '/CreateNewPasswordScreen',
            params: { email: contactStr, otp },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#111" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry, it happens. Please enter the code sent to {maskedContact}
                        </Text>
                    </View>

                    <View style={styles.otpWrapper}>
                        <OtpInput
                            numberOfDigits={4}
                            onTextChange={(text) => setOtp(text)}
                            onFilled={(text) => setOtp(text)}
                            theme={{
                                containerStyle: styles.otpContainer,
                                inputsContainerStyle: styles.inputsContainer,
                                pinCodeContainerStyle: styles.pinCodeContainer,
                                pinCodeTextStyle: styles.pinCodeText,
                                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                            }}
                        />
                    </View>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't get the code? </Text>
                        <Pressable onPress={seconds === 0 ? handleResend : undefined}>
                            <Text style={styles.resendLink}>
                                {seconds > 0 ? `Resend in 00:${seconds.toString().padStart(2, '0')}` : 'Resend'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "white" },
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 27, paddingTop: 10 },
    header: { marginBottom: 30 },
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 20 },
    titleContainer: { marginBottom: 40 },
    title: { fontSize: 28, fontWeight: "700", color: "#111111", marginBottom: 10 },
    subtitle: { fontSize: 15, color: "#666666", lineHeight: 22 },
    otpWrapper: { marginBottom: 30 },
    otpContainer: { width: "100%" },
    inputsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    pinCodeContainer: { width: 65, height: 65, backgroundColor: '#F5F5F5', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center' },
    activePinCodeContainer: { borderColor: '#6366FF', backgroundColor: '#FFFFFF' },
    pinCodeText: { fontSize: 24, fontWeight: '700', color: '#111111' },
    resendContainer: { flexDirection: 'row', alignItems: 'center' },
    resendText: { fontSize: 14, color: '#666666' },
    resendLink: { fontSize: 14, fontWeight: '600', color: '#6366FF' },
    bottomContainer: { paddingHorizontal: 25, paddingBottom: 40 },
    button: { backgroundColor: "#6366FF", paddingVertical: 16, borderRadius: 20, alignItems: "center" },
    buttonText: { fontSize: 16, fontWeight: "600", color: "white" },
});
