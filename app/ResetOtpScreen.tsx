import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { useState } from "react";
import { useTimer } from 'react-timer-hook';

export default function ResetOtpScreen() {
    const router = useRouter();
    const { phoneNumber } = useLocalSearchParams();
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber || '';
    const [otp, setOtp] = useState('');
    const time = new Date();
    time.setSeconds(time.getSeconds() + 45);
    const { seconds } = useTimer({ expiryTimestamp: time });
    const maskedNumber = phone
        ? phone.slice(0, -3).replace(/\d/g, '*') + phone.slice(-3)
        : '';

    const handleVerify = () => {
        if (otp.length !== 4) {
            Alert.alert("Validation Error", "Please enter a complete 4-digit code.");
            return;
        }

        console.log('Verify this code for reset:', otp);
        // Navigate to the next screen in the flow
        router.push('/CreateNewPasswordScreen'); 
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
                        <Text style={styles.subtitle}>Don't worry, it happens. Please enter the code sent to {maskedNumber}</Text>
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
                        <Pressable>
                            <Text style={styles.resendLink}>
                                Resend it {seconds > 0 ? `00:${seconds.toString().padStart(2, '0')}` : ''}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleVerify}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "white",
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 27,
        paddingTop: 10,
    },
    header: {
        marginBottom: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
    },
    titleContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111111",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: "#666666",
        lineHeight: 22,
    },
    otpWrapper: {
        marginBottom: 30,
    },
    otpContainer: {
        width: "100%",
    },
    inputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pinCodeContainer: {
        width: 65,
        height: 65,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activePinCodeContainer: {
        borderColor: '#6366FF',
        backgroundColor: '#FFFFFF',
    },
    pinCodeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111111',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    resendText: {
        fontSize: 14,
        color: '#666666',
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366FF',
    },
    bottomContainer: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: "#6366FF",
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    }
});