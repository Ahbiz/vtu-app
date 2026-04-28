import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CountryPicker, { Country } from "react-native-country-picker-modal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EnterPhoneScreen() {
    const router = useRouter();
    const [countryCode, setCountryCode] = useState<any>("NG");
    const [callingCode, setCallingCode] = useState("234");
    const [pickerVisible, setPickerVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const onSelectCountry = (country: Country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0])
        setPickerVisible(false);
    };

    const formatPhoneNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const startsWithZero = cleaned.startsWith('0');
        const group1Size = startsWithZero ? 4 : 3;
        const group2Size = 3;
        const group3Size = 4;

        let formatted = '';
        if (cleaned.length > 0) {
            formatted += cleaned.substring(0, group1Size);
        }
        if (cleaned.length > group1Size) {
            formatted += ' ' + cleaned.substring(group1Size, group1Size + group2Size);
        }
        if (cleaned.length > group1Size + group2Size) {
            formatted += ' ' + cleaned.substring(group1Size + group2Size, group1Size + group2Size + group3Size);
        }

        return formatted;
    };

    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(formatPhoneNumber(text));
    };

    const handleSendCode = () => {
        if (!phoneNumber.trim()) {
            Alert.alert("Error", "Please enter your phone number.");
            return;
        }

        const fullPhoneNumber = `+${callingCode} ${phoneNumber}`;
        router.push({ pathname: "/SmsReset", params: { phoneNumber: fullPhoneNumber } });
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
                    <Text style={styles.subtitle}>Enter the phone number associated with your account to receive a reset code.</Text>
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
                            onChangeText={handlePhoneNumberChange}
                            placeholder="Enter Phone Number"
                            placeholderTextColor="#AAAAAA"
                            keyboardType="phone-pad"
                        />
                    </View>
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
