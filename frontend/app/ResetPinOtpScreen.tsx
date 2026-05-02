import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { useState } from "react";
import { useTimer } from 'react-timer-hook';
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function ResetPinOtpScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [otp, setOtp] = useState('');
    const time = new Date();
    time.setSeconds(time.getSeconds() + 45);
    const { seconds } = useTimer({ expiryTimestamp: time });

    if (!fontsLoaded) return null;

    const handleVerify = () => {
        if (otp.length !== 4) {
            Alert.alert("Validation Error", "Please enter a complete 4-digit code.");
            return;
        }
        

        router.push('/CreateNewPinScreen'); 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Verify OTP</Text>
                    <View style={styles.backButton} />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconBox}>
                            <Ionicons name="mail-unread-outline" size={40} color={COLORS.primary} />
                        </View>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Enter OTP</Text>
                        <Text style={styles.subtitle}>We've sent a 4-digit one-time password to your contact info.</Text>
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
                        <Text style={styles.buttonText}>Verify & Proceed</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backButton: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    iconContainer: { alignItems: "center", marginTop: 10, marginBottom: 24 },
    iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center" },
    titleContainer: { marginBottom: 30 },
    title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#111", textAlign: "center", marginBottom: 10 },
    subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#666", textAlign: "center", lineHeight: 22 },
    otpWrapper: { marginBottom: 30, alignItems: 'center' },
    otpContainer: { width: "85%" },
    inputsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    pinCodeContainer: { width: 60, height: 60, backgroundColor: '#E6F0FF', borderRadius: 12, borderWidth: 1, borderColor: '#E6F0FF', justifyContent: 'center', alignItems: 'center' },
    activePinCodeContainer: { borderColor: COLORS.primary, backgroundColor: '#FFFFFF' },
    pinCodeText: { fontSize: 22, fontFamily: "Poppins_700Bold", color: '#111' },
    resendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    resendText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: '#666' },
    resendLink: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 10 : 20 },
    button: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 12, alignItems: "center" },
    buttonText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white" }
});
