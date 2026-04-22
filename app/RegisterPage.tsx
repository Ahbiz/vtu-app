import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CountryPicker, { Country } from "react-native-country-picker-modal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [countryCode, setCountryCode] = useState<any>("NG");
    const [callingCode, setCallingCode] = useState("234");
    const [pickerVisible, setPickerVisible] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

    const onSelectCountry = (country: Country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
        setPickerVisible(false);
    };

    const handleContinue = () => {

        if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields before proceeding.");
            return;
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Validation Error", "Please enter a valid email address.");
            return;
        }


        const fullPhoneNumber = `+${callingCode} ${phoneNumber}`;
        router.push({ pathname: "/OtpPage", params: { phoneNumber: fullPhoneNumber } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding"
                keyboardVerticalOffset={Platform.OS === "android" ? 90 : 0}
                style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}>
                    <View style={styles.logoRow}>
                        <View style={styles.letterBox}>
                            <Text style={styles.letterInBox}>A</Text>
                        </View>
                        <Text style={styles.logoText}>hbizPay</Text>
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Full name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Jimmy Grammy"
                            placeholderTextColor="#AAAAAA"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Jimmygrammy@gmail.com"
                            placeholderTextColor="#AAAAAA"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.phoneRow}>
                            <TouchableOpacity
                                style={styles.countryPickerButton}
                                onPress={() => setPickerVisible(true)}
                            >
                                <CountryPicker
                                    countryCode={countryCode}
                                    withFlag
                                    withCallingCode
                                    withFilter
                                    withModal
                                    visible={pickerVisible}
                                    onSelect={onSelectCountry}
                                    onClose={() => setPickerVisible(false)}
                                />
                                <Text style={styles.callingCodeText}>+{callingCode}</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={[styles.input, styles.phoneNumberInput]}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter Phone Number"
                                placeholderTextColor="#AAAAAA"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordInputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter New Password"
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
                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttontext}>Continue</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
    },

    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 70,
        marginBottom: 35
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

    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    countryPickerButton: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 6,
        gap: 4,
    },

    callingCodeText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111111",
    },

    phoneNumberInput: {
        flex: 1,
    },

    passwordInputRow: {
        flexDirection: "row",
        alignItems: "center",
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
        marginTop: 70
    }
});