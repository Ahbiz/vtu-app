import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient, { setAuthToken } from '../utils/api';
import ForgotPasswordSheet from './ForgotPasswordSheet';

export default function LoginScreen() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomSheetRef = useRef<BottomSheetModal>(null)

    const handleForgotPassword = () => {
        bottomSheetRef.current?.present();
    };

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/auth/login', {
                email: email.trim(),
                password,
            });

            const { token } = response.data;
            setAuthToken(token);
            router.replace("/(dashboard)" as any);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
            <View style={styles.logoRow}>
                <View style={styles.letterBox}>
                    <Text style={styles.letterInBox}>A</Text>
                </View>
                <Text style={styles.logoText}>hbizPay</Text>
            </View>
            <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input}
                    placeholder="Ahbiz123@gmail.com"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail} />
            </View>

            <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Enter your password"
                        placeholderTextColor="#AAAAAA"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color="#AAAAAA"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View>
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttontext}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.footerLinks}>
                <Text style={styles.forgotPassword} onPress={handleForgotPassword}>Forgot password?</Text>
                <Text style={styles.signUpText}>New User? <Text style={styles.linkText} onPress={() => router.push("/RegisterScreen")}>Create Account</Text></Text>
            </View>

        </SafeAreaView>
        <ForgotPasswordSheet bottomSheetRef={bottomSheetRef} />
    </BottomSheetModalProvider>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 120,
        marginBottom: 50
    },
    letterBox: {
        width: 52,
        height: 52,
        backgroundColor: "#6366FF",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 4,
        transform: [{ rotate: "-8deg" }],
    },
    letterInBox: {
        fontSize: 30,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    logoText: {
        fontSize: 40,
        fontWeight: "800",
        color: "#6366FF",
        letterSpacing: 0.5,
    },
    label: {
        color: "#AAAAAA",
        fontSize: 13,
        marginBottom: 5,
    },
    input: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111111",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 6,
    },
    fieldWrapper: {
        marginTop: 20,
        marginHorizontal: 27,
    },
    passwordInputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        backgroundColor: "#6366FF",
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 70,
        marginBottom: 45
    },
    buttontext: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
    footerLinks: {
        justifyContent: "center",
        alignItems: "center",
        gap: 15
    },
    forgotPassword: {
        color: "#6366FF",
        fontSize: 14,
        fontWeight: "600",
    },
    signUpText: {
        color: "#AAAAAA",
        fontSize: 14,
    },
    linkText: {
        color: "#6366FF",
        fontWeight: "700",
    },
    screen: {
        flex: 1,
        padding: 24
    },
    forgotText: {
        color: '#4CAF50',
        textAlign: 'center',
        marginTop: 16
    },
})