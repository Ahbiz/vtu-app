import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EnterEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleSendCode = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email.trim())) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }
        router.push({ pathname: "/ResetOtpScreen", params: { phoneNumber: email.trim() } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding"
                keyboardVerticalOffset={Platform.OS === "android" ? 90 : 0}
                style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#111" />
                    </TouchableOpacity>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter the email address associated with your account to receive a reset code.</Text>
                </View>

                <View style={styles.fieldWrapper}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="e.g. Ahbiz123@gmail.com"
                        placeholderTextColor="#AAAAAA"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                    <Text style={styles.buttontext}>Send Code</Text>
                </TouchableOpacity>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
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
        paddingHorizontal: 27,
        marginBottom: 30,
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
    fieldWrapper: {
        marginTop: 20,
        marginHorizontal: 27,
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
    buttontext: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
    button: {
        backgroundColor: "#6366FF",
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 25,
        marginTop: 50
    }
});
