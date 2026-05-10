import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "@/utils/api";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import DropdownModal from "@/components/DropdownModal";
import { COLORS } from "@/constants/app-data";

export default function ElectricityBillScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [provider, setProvider] = useState("");
    const [meterType, setMeterType] = useState("");
    const [meterNumber, setMeterNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [savedPhone, setSavedPhone] = useState("");
    const [hasTransactionPin, setHasTransactionPin] = useState(false);

    const [isProviderModalVisible, setProviderModalVisible] = useState(false);
    const [isMeterTypeModalVisible, setMeterTypeModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                try {
                    const response = await apiClient.get('/auth/me');
                    setWalletBalance(response.data.walletBalance || 0);
                    setSavedPhone(response.data.phone || "");
                    setHasTransactionPin(response.data.hasTransactionPin || false);
                } catch (error) {
                    console.error('Failed to fetch balance:', error);
                }
            };
            fetchProfile();
        }, [])
    );

    const DISCO_MAP: Record<string, number> = {
        "Ikeja Electric": 1,
        "Eko Electric": 2,
        "Kano Electric": 3,
        "Port Harcourt Electric": 4,
        "Jos Electric": 5,
        "Ibadan Electric": 6,
        "Kaduna Electric": 7,
        "Abuja Electric": 8,
        "Benin Electric": 9,
        "Enugu Electric": 10,
    };
    const PROVIDERS = Object.keys(DISCO_MAP);
    const METER_TYPES = ["Prepaid", "Postpaid"];

    const handlePurchase = async () => {
        if (!hasTransactionPin) {
            Alert.alert(
                "PIN Required",
                "You need to set up a transaction PIN before making payments.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Set Up PIN", onPress: () => router.push("/CreateNewPinScreen") }
                ]
            );
            return;
        }

        if (!provider || !meterType || !meterNumber || !amount || !pin) {
            Alert.alert("Error", "Please fill in all fields including your PIN.");
            return;
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }

        try {
            setLoading(true);

            // 1. Verify Meter Number
            const verifyRes = await apiClient.get(`/vtu/verify-meter?meter_number=${meterNumber.trim()}&disco=${DISCO_MAP[provider]}&meter_type=${meterType.toLowerCase()}`);
            const customerName = verifyRes.data?.data?.customer_name || verifyRes.data?.customer_name || 'Verified Customer';

            // 2. Confirm Payment
            Alert.alert(
                "Confirm Details",
                `Customer: ${customerName}\nDisco: ${provider}\nAmount: ₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
                [
                    { text: "Cancel", style: "cancel", onPress: () => setLoading(false) },
                    { 
                        text: "Confirm & Pay", 
                        onPress: async () => {
                            try {
                                const response = await apiClient.post('/vtu/electricity', {
                                    disco: DISCO_MAP[provider],
                                    meterType: meterType.toLowerCase(),
                                    meterNumber: meterNumber.trim(),
                                    amount: numAmount,
                                    pin: pin.trim()
                                });

                                const token = response.data?.data?.token || response.data?.token;
                                Alert.alert(
                                    "Success", 
                                    `Electricity payment successful!${token ? `\n\nYour Token: ${token}` : ''}`, 
                                    [{ text: "OK", onPress: () => router.back() }]
                                );
                            } catch (error: any) {
                                const message = error.response?.data?.message || 'Electricity payment failed. Please try again.';
                                Alert.alert("Error", message);
                            } finally {
                                setLoading(false);
                            }
                        }
                    }
                ]
            );
        } catch (error: any) {
            const message = error.response?.data?.message || 'Verification failed. Please check your meter details.';
            Alert.alert("Verification Error", message);
            setLoading(false);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Electricity Bill</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Text style={styles.label}>Select Provider</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10 }}>Balance: ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setProviderModalVisible(true)}
                >
                    <Text style={provider ? styles.inputText : styles.inputTextMuted}>
                        {provider || "Select Electricity Company"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <Text style={styles.label}>Meter Type</Text>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setMeterTypeModalVisible(true)}
                >
                    <Text style={meterType ? styles.inputText : styles.inputTextMuted}>
                        {meterType || "Prepaid / Postpaid"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <Text style={styles.label}>Meter Number</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Enter meter number" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="number-pad" 
                        value={meterNumber}
                        onChangeText={setMeterNumber}
                    />
                </View>

                <Text style={styles.label}>Amount</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="0.00" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="numeric" 
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <Text style={styles.label}>Phone Number (Optional)</Text>
                <View style={[styles.inputContainer, { marginBottom: 8 }]}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="08x xxx xxxx" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="phone-pad" 
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>
                {savedPhone ? (
                    <TouchableOpacity onPress={() => setPhone(savedPhone)} style={styles.autofillChip}>
                        <Text style={styles.autofillText}>Use: {savedPhone}</Text>
                    </TouchableOpacity>
                ) : null}

                <Text style={styles.label}>Transaction PIN</Text>
                <View style={[styles.inputContainer, { marginBottom: 8 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="••••"
                        placeholderTextColor="#A0ABC0"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        value={pin}
                        onChangeText={setPin}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.payBtn} onPress={handlePurchase} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payBtnText}>Verify & Pay</Text>
                    )}
                </TouchableOpacity>
            </View>

            <DropdownModal 
                visible={isProviderModalVisible}
                title="Select Provider"
                options={PROVIDERS}
                onSelect={setProvider}
                onClose={() => setProviderModalVisible(false)}
            />

            <DropdownModal 
                visible={isMeterTypeModalVisible}
                title="Meter Type"
                options={METER_TYPES}
                onSelect={setMeterType}
                onClose={() => setMeterTypeModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10, marginTop: 10 },
    inputContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, marginBottom: 16 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputTextMuted: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#A0ABC0" },
    autofillChip: { alignSelf: 'flex-start', backgroundColor: '#E6F0FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
    autofillText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: COLORS.primary },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
