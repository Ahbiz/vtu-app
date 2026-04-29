import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CreateNewPasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleContinue = () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 8 || !hasLetter || !hasNumber) {
            Alert.alert("Error", "Password does not meet the requirements.");
            return;
        }

        Alert.alert("Success", "Your password has been successfully reset!", [
            { text: "OK", onPress: () => router.push("/LoginScreen") }
        ]);
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
                        <Text style={styles.title}>Create new password</Text>
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Choose a password</Text>
                        <View style={styles.passwordInputRow}>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter new password"
                                placeholderTextColor="#AAAAAA"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#AAAAAA"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>
                            At least <Text style={styles.boldText}>8 characters</Text>, containing <Text style={styles.boldText}>a letter</Text> and <Text style={styles.boldText}>a number</Text>
                        </Text>
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Confirm password</Text>
                        <View style={styles.passwordInputRow}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter password"
                                placeholderTextColor="#AAAAAA"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#AAAAAA"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttontext}>Continue</Text>
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
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111111",
    },
    fieldWrapper: {
        marginBottom: 25,
    },
    label: {
        color: "#333333",
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    passwordInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingBottom: 6,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#111111",
        paddingVertical: 6,
    },
    eyeIcon: {
        padding: 5,
    },
    helperText: {
        fontSize: 13,
        color: "#666666",
        marginTop: 8,
        lineHeight: 18,
    },
    boldText: {
        fontWeight: "700",
        color: "#333333",
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
    buttontext: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    }
});
