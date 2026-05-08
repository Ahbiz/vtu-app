import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "@/utils/api";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import DropdownModal from "@/components/DropdownModal";

export default function CableTVScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [provider, setProvider] = useState("");
    const [smartcard, setSmartcard] = useState("");
    const [plan, setPlan] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);

    const [isProviderModalVisible, setProviderModalVisible] = useState(false);
    const [isPlanModalVisible, setPlanModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                try {
                    const response = await apiClient.get('/auth/me');
                    setWalletBalance(response.data.walletBalance || 0);
                } catch (error) {
                    console.error('Failed to fetch balance:', error);
                }
            };
            fetchProfile();
        }, [])
    );

    const PROVIDER_MAP: Record<string, number> = {
        "GOTV": 1,
        "DSTV": 2,
        "Startimes": 3
    };
    const PROVIDERS = Object.keys(PROVIDER_MAP);

    const CABLE_PLANS: Record<string, { label: string, id: number, amount: number }[]> = {
        "DSTV": [
            { label: "DStv Padi - ₦3,600", id: 1, amount: 3600 },
            { label: "DStv YANGA - ₦4,200", id: 2, amount: 4200 },
            { label: "DStv Compact - ₦12,500", id: 3, amount: 12500 },
            { label: "DStv Premium - ₦29,510", id: 5, amount: 29510 },
            { label: "DStv Asia - ₦12,400", id: 6, amount: 12400 },
        ],
        "GOTV": [
            { label: "GOtv Smallie - ₦1,100", id: 10, amount: 1100 },
            { label: "GOtv Jinja - ₦2,250", id: 11, amount: 2250 },
            { label: "GOtv Jolli - ₦3,300", id: 12, amount: 3300 },
            { label: "GOtv Max - ₦4,850", id: 13, amount: 4850 },
        ],
        "Startimes": [
            { label: "Nova - ₦1,200", id: 20, amount: 1200 },
            { label: "Basic - ₦2,100", id: 21, amount: 2100 },
            { label: "Smart - ₦2,800", id: 22, amount: 2800 },
            { label: "Classic - ₦3,100", id: 23, amount: 3100 },
        ]
    };

    const currentPlans = provider ? (CABLE_PLANS[provider] || []) : [];
    const currentPlanLabels = currentPlans.map(p => p.label);

    const handleProviderChange = (selProvider: string) => {
        setProvider(selProvider);
        setPlan(""); // reset plan when provider changes
    };

    const handlePurchase = async () => {
        if (!provider || !smartcard || !plan || !pin) {
            Alert.alert("Error", "Please fill in all fields including your PIN.");
            return;
        }

        const selectedPlanData = currentPlans.find(p => p.label === plan);
        if (!selectedPlanData) {
            Alert.alert("Error", "Invalid plan selected.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/vtu/cable', {
                cable: PROVIDER_MAP[provider],
                iuc: smartcard.trim(),
                cablePlan: selectedPlanData.id,
                amount: selectedPlanData.amount,
                pin: pin.trim()
            });

            Alert.alert("Success", "Cable subscription successful!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Cable subscription failed. Please try again.';
            Alert.alert("Error", message);
        } finally {
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
                <Text style={styles.headerTitle}>Cable TV</Text>
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

                <Text style={styles.label}>Phone Number (Optional)</Text>
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
                onSelect={handleProviderChange}
                onClose={() => setProviderModalVisible(false)}
            />

            <DropdownModal 
                visible={isPlanModalVisible}
                title="Select Plan"
                options={currentPlanLabels}
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
