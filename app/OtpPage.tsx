import { View, Text, StyleSheet, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react"
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTimer } from 'react-timer-hook'
import { OtpInput } from "react-native-otp-entry"

export default function OtpPage() {
    const router = useRouter()
    const { phoneNumber } = useLocalSearchParams()
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    const expiryTime = new Date()
    expiryTime.setSeconds(expiryTime.getSeconds() + 180)
    const { seconds, minutes, isRunning } = useTimer({ expiryTimestamp: expiryTime });

    const maskedNumber = phone
        ? phone.slice(0, -3).replace(/\d/g, '*') + phone.slice(-3)
        : '';

    const [otp, setOtp] = useState('');
    const handleVerify = () => {
        if (otp.length !== 4) {
            Alert.alert("Validation Error", "Please enter a complete 4-digit OTP.");
            return;
        }
        console.log('Verify this code:', otp);
        router.push('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => router.push("/RegisterPage")}>
                            <Ionicons name="arrow-back" size={24} color="#4F6EF7" />
                        </Pressable>
                        <Text style={styles.headerText}>OTP Verification</Text>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>
                            Please Enter{'\n'}OTP Verification
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            Code was sent to {maskedNumber}
                        </Text>
                        <Text style={styles.infoText}>
                            This code will expire in <Text style={styles.timerText}>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</Text>
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
                            }}
                        />
                    </View>

                    <View style={styles.resendRow}>
                        <Text style={styles.resendPrompt}>Didn't receive an OTP?</Text>
                        <Pressable style={styles.resendButton}>
                            <Ionicons
                                name="refresh-outline"
                                size={18}
                                color="#4F6EF7"
                                style={{ transform: [{ scaleX: -1 }] }}
                            />
                            <Text style={styles.resendText}>Resend</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                        <Text style={styles.verifyButtonText}>Verify and Create Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
    },
    headerText: {
        color: '#4F6EF7',
        fontSize: 16,
        fontWeight: '700',
    },
    titleContainer: {
        marginBottom: 16,
    },
    titleText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 34,
    },
    infoContainer: {
        marginBottom: 40,
    },
    infoText: {
        fontSize: 14,
        color: '#7A7A7A',
        marginBottom: 6,
    },
    timerText: {
        color: '#FF4B4B',
        fontWeight: '600',
    },
    otpWrapper: {
        marginBottom: 30,
    },
    otpContainer: {
        width: '100%',
    },
    inputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pinCodeContainer: {
        width: 65,
        height: 65,
        backgroundColor: '#EAEAEA',
        borderRadius: 16,
        borderWidth: 0,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinCodeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    resendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resendPrompt: {
        color: '#7A7A7A',
        fontSize: 14,
        fontWeight: '500',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resendText: {
        color: '#4F6EF7',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    verifyButton: {
        backgroundColor: '#4355F3',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
