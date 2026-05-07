import DropdownModal from "@/components/DropdownModal";
import PaymentButton from "@/components/PaymentButton";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserEmail } from "@/utils/api";

export default function FundWalletScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [method, setMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [isMethodModalVisible, setMethodModalVisible] = useState(false);

    const FUNDING_METHODS = ["Bank Transfer", "Card Payment", "USSD"];

    if (!fontsLoaded) return null;

    const parsedAmount = parseFloat(amount);
    const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

    const handleProceed = () => {
        if (!method) {
            Alert.alert("Error", "Please select a funding method.");
            return;
        }
        if (!isAmountValid) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }
        if (method === "Bank Transfer") {
            Alert.alert(
                "Bank Transfer",
                "Transfer to your dedicated virtual account shown on the Wallet page. Your balance updates automatically once received."
            );
        } else if (method === "USSD") {
            Alert.alert("USSD", "USSD payment coming soon.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fund Wallet</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Select Funding Method</Text>
                <TouchableOpacity
                    style={styles.inputContainer}
                    activeOpacity={0.7}
                    onPress={() => setMethodModalVisible(true)}
                >
                    <Text style={method ? styles.inputText : styles.inputTextMuted}>
                        {method || "Choose payment method"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

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

                {method === "Bank Transfer" && (
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color="#0052CC" />
                        <Text style={styles.infoText}>
                            Transfer to your dedicated virtual account on the Wallet page. Your balance updates automatically.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomContainer}>
                {method === "Card Payment" && isAmountValid ? (
                    <PaymentButton
                        amount={parsedAmount}
                        email={getUserEmail()}
                        onSuccess={(reference) => {
                            Alert.alert(
                                "Payment Received",
                                `Reference: ${reference}\nYour wallet will be credited shortly.`,
                                [{ text: "OK", onPress: () => router.back() }]
                            );
                        }}
                        onCancel={() => Alert.alert("Cancelled", "Payment was cancelled.")}
                    />
                ) : (
                    <TouchableOpacity style={styles.payBtn} onPress={handleProceed}>
                        <Text style={styles.payBtnText}>Proceed</Text>
                    </TouchableOpacity>
                )}
            </View>

            <DropdownModal
                visible={isMethodModalVisible}
                title="Funding Method"
                options={FUNDING_METHODS}
                onSelect={setMethod}
                onClose={() => setMethodModalVisible(false)}
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
    infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#E6F0FF", padding: 16, borderRadius: 12, marginTop: 10 },
    infoText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", color: "#0052CC", lineHeight: 20 },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
