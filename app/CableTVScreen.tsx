import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import DropdownModal from "@/components/DropdownModal";

export default function CableTVScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [provider, setProvider] = useState("");
    const [smartcard, setSmartcard] = useState("");
    const [plan, setPlan] = useState("");
    const [phone, setPhone] = useState("");

    const [isProviderModalVisible, setProviderModalVisible] = useState(false);
    const [isPlanModalVisible, setPlanModalVisible] = useState(false);

    const PROVIDERS = ["DSTV", "GOTV", "Startimes", "Showmax"];
    const PLANS = ["Compact Plus - N14,250", "Compact - N9,000", "Confam - N5,300", "Yanga - N2,950"];

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cable TV</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Select Provider</Text>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setProviderModalVisible(true)}
                >
                    <Text style={provider ? styles.inputText : styles.inputTextMuted}>
                        {provider || "DSTV / GOTV / Startimes"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <Text style={styles.label}>Smartcard Number / IUC</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Enter decoder number" 
                        placeholderTextColor="#A0ABC0" 
                        keyboardType="number-pad" 
                        value={smartcard}
                        onChangeText={setSmartcard}
                    />
                </View>

                <Text style={styles.label}>Select Plan</Text>
                <TouchableOpacity 
                    style={styles.inputContainer} 
                    activeOpacity={0.7}
                    onPress={() => setPlanModalVisible(true)}
                >
                    <Text style={plan ? styles.inputText : styles.inputTextMuted}>
                        {plan || "Choose package"}
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
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.payBtn}>
                    <Text style={styles.payBtnText}>Verify & Pay</Text>
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
                visible={isPlanModalVisible}
                title="Select Plan"
                options={PLANS}
                onSelect={setPlan}
                onClose={() => setPlanModalVisible(false)}
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
