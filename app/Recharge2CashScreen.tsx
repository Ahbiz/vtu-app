import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";
import DropdownModal from "@/components/DropdownModal";

export default function Recharge2CashScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [network, setNetwork] = useState("");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");

    const [isNetworkModalVisible, setNetworkModalVisible] = useState(false);

    const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"];

    if (!fontsLoaded) return null;

    // Calculate receivable amount dynamically
    const conversionRate = 0.8; // 80%
    const numericAmount = parseFloat(amount) || 0;
    const receivable = (numericAmount * conversionRate).toFixed(2);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recharge to Cash</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.infoText}>Convert your excess airtime back to cash easily.</Text>

                <Text style={styles.label}>Select Network</Text>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setNetworkModalVisible(true)}
                >
                    <Text style={network ? styles.inputText : styles.inputTextMuted}>
                        {network || "MTN / Airtel / Glo / 9mobile"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="08x xxx xxxx" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="phone-pad" 
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                <Text style={styles.label}>Airtime Amount</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="0.00" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="number-pad" 
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <View style={styles.exchangeRateBox}>
                    <Text style={styles.exchangeRateText}>You will receive: NGN {receivable}</Text>
                    <Text style={styles.feeText}>Rate: {conversionRate * 100}%</Text>
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.payBtn}>
                    <Text style={styles.payBtnText}>Convert to Cash</Text>
                </TouchableOpacity>
            </View>

            <DropdownModal 
                visible={isNetworkModalVisible}
                title="Select Network"
                options={NETWORKS}
                onSelect={setNetwork}
                onClose={() => setNetworkModalVisible(false)}
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
    infoText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#666", marginBottom: 20 },
    label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10 },
    inputContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, marginBottom: 16 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputTextMuted: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#A0ABC0" },
    exchangeRateBox: { backgroundColor: COLORS.primaryGhost, padding: 16, borderRadius: 10, marginTop: 10, alignItems: "center" },
    exchangeRateText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
    feeText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: COLORS.textMuted, marginTop: 4 },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
