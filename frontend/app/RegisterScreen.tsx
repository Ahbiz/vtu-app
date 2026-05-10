import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneNumberInput, { PhoneNumberInputRef } from "../components/PhoneNumberInput";
import apiClient from "../utils/api";

export default function RegisterScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [localPhone, setLocalPhone] = useState("");
    const [formattedPhone, setFormattedPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const phoneRef = useRef<PhoneNumberInputRef>(null);

    const handleContinue = async () => {
        if (!fullName.trim() || !email.trim() || !localPhone.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields before proceeding.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Validation Error", "Please enter a valid email address.");
            return;
        }

        const checkValid = phoneRef.current?.isValidNumber(localPhone);
        if (!checkValid) {
            Alert.alert("Validation Error", "Please enter a valid phone number.");
            return;
        }

        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            Alert.alert("Validation Error", "Please enter your full name (first and last name).");
            return;
        }

        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        try {
            setLoading(true);
            await apiClient.post("/auth/register", {
                firstName,
                lastName,
                email: email.trim(),
                phone: formattedPhone,
                password,
            });
            router.push({ pathname: "/VerifyAccountScreen", params: { email: email.trim() } });
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Registration failed. Please try again.";
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "android" ? 90 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.letterBox}>
                                <Text style={styles.letterInBox}>A</Text>
                            </View>
                            <Text style={styles.logoText}>hbizPay</Text>
                        </View>
                        <Text style={styles.headingText}>Create your account</Text>
                        <Text style={styles.subText}>
                            Join thousands topping up smarter every day.
                        </Text>
                    </View>

                    {/* Form card */}
                    <View style={styles.card}>
                        {/* Full name */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Ahbiz Mohammed"
                                    placeholderTextColor="#9CA3AF"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>Phone Number</Text>
                            <PhoneNumberInput
                                ref={phoneRef}
                                defaultCode="NG"
                                onChangeText={setLocalPhone}
                                onChangeFormattedText={setFormattedPhone}
                                placeholder="801 234 5678"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Create a strong password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Continue</Text>
                                <Text style={styles.buttonArrow}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/LoginScreen" as any)}>
                            <Text style={styles.footerLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EEF2FF",
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },

    // ── Header ───────────────────────────────────────────────────────────────
    header: {
        alignItems: "center",
        paddingTop: 40,
        paddingBottom: 28,
        paddingHorizontal: 24,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
    },
    letterBox: {
        width: 36,
        height: 36,
        backgroundColor: "#4F46E5",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    letterInBox: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    logoText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#111827",
    },
    headingText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    subText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },

    // ── Form card ────────────────────────────────────────────────────────────
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginHorizontal: 20,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    fieldWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
        color: "#6B7280",
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 12,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        color: "#111827",
    },
    eyeBtn: {
        padding: 4,
    },

    // ── CTA button ───────────────────────────────────────────────────────────
    button: {
        backgroundColor: "#4F46E5",
        height: 54,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 20,
        marginTop: 24,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    buttonArrow: {
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    footerLink: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4F46E5",
    },
});
