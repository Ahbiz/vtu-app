import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import DropdownModal from "@/components/DropdownModal";

export default function RechargeCardScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [network, setNetwork] = useState("");
    const [denomination, setDenomination] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [amount, setAmount] = useState("");

    const [isNetworkModalVisible, setNetworkModalVisible] = useState(false);
    const [isDenomModalVisible, setDenomModalVisible] = useState(false);

    const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"];
    const DENOMINATIONS = ["N100", "N200", "N500", "N1000", "N5000"];

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recharge Card PINs</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

                <Text style={styles.label}>Select Denomination</Text>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setDenomModalVisible(true)}
                >
                    <Text style={denomination ? styles.inputText : styles.inputTextMuted}>
                        {denomination || "N100, N200, N500..."}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <Text style={styles.label}>Quantity</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="1" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="number-pad" 
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

                <Text style={styles.label}>Total Amount</Text>
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
                
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.payBtn}>
                    <Text style={styles.payBtnText}>Generate PINs</Text>
                </TouchableOpacity>
            </View>

            <DropdownModal 
                visible={isNetworkModalVisible}
                title="Select Network"
                options={NETWORKS}
                onSelect={setNetwork}
                onClose={() => setNetworkModalVisible(false)}
            />

            <DropdownModal 
                visible={isDenomModalVisible}
                title="Select Denomination"
                options={DENOMINATIONS}
                onSelect={setDenomination}
                onClose={() => setDenomModalVisible(false)}
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
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
