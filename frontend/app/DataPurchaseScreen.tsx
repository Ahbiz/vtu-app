import DropdownModal from "@/components/DropdownModal";
import { COLORS } from "@/constants/app-data";
import apiClient from "@/utils/api";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const NETWORK_MAP: Record<string, number> = { MTN: 1, AIRTEL: 2, GLO: 3, "9MOBILE": 4 };
const NETWORKS = [
    { id: "MTN", color: "#FFCC00" },
    { id: "AIRTEL", color: "#E3000F" },
    { id: "GLO", color: "#009900" },
    { id: "9MOBILE", color: "#1E1E1E" },
];

interface DataPlan {
    id: number;
    name: string;
    amount: number;
    type: string;
    validity: string;
}

export default function DataPurchaseScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [selectedNetwork, setSelectedNetwork] = useState("MTN");
    const [plans, setPlans] = useState<DataPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
    const [selectedPlanLabel, setSelectedPlanLabel] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [savedPhone, setSavedPhone] = useState("");
    const [isPlanModalVisible, setPlanModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                try {
                    const response = await apiClient.get('/auth/me');
                    setWalletBalance(response.data.walletBalance || 0);
                    setSavedPhone(response.data.phone || "");
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            };
            fetchProfile();
        }, [])
    );

    // Fetch plans from backend whenever network changes
    useEffect(() => {
        const fetchPlans = async () => {
            setPlansLoading(true);
            setSelectedPlan(null);
            setSelectedPlanLabel("");
            try {
                const networkId = NETWORK_MAP[selectedNetwork];
                const response = await apiClient.get(`/vtu/data/plans?network=${networkId}`);
                setPlans(response.data.plans || []);
            } catch (error) {
                console.error('Failed to fetch data plans:', error);
                setPlans([]);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, [selectedNetwork]);

    const planLabels = plans.map(p => `${p.name} ${p.type} - ${p.validity} (₦${p.amount.toLocaleString()})`);

    const handleSelectPlan = (label: string) => {
        setSelectedPlanLabel(label);
        const idx = planLabels.indexOf(label);
        setSelectedPlan(idx >= 0 ? plans[idx] : null);
    };

    const handlePurchase = async () => {
        if (!selectedNetwork || !selectedPlan || !phone || !pin) {
            Alert.alert("Error", "Please fill in all fields including your PIN.");
            return;
        }

        try {
            setLoading(true);
            await apiClient.post('/vtu/data', {
                network: NETWORK_MAP[selectedNetwork],
                phone: phone.trim(),
                dataPlan: selectedPlan.id,
                amount: selectedPlan.amount,
                pin: pin.trim(),
            });
            Alert.alert("Success", "Data purchase successful!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Data purchase failed. Please try again.';
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
                <Text style={styles.headerTitle}>Data Purchase</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Select Network</Text>
                <View style={styles.networkRow}>
                    {NETWORKS.map(net => (
                        <TouchableOpacity
                            key={net.id}
                            style={[styles.networkCard, { backgroundColor: net.color }, selectedNetwork === net.id && styles.networkSelected]}
                            onPress={() => setSelectedNetwork(net.id)}
                            activeOpacity={0.8}
                        >
                            {net.id === "MTN" && <Text style={[styles.networkLabel, { color: "#000" }]}>MTN</Text>}
                            {net.id === "AIRTEL" && <Text style={[styles.networkLabel, { color: "#FFF" }]}>Airtel</Text>}
                            {net.id === "GLO" && <Text style={[styles.networkLabel, { color: "#FFF" }]}>Glo</Text>}
                            {net.id === "9MOBILE" && <Text style={[styles.networkLabel, { color: "#FFF" }]}>9Mobile</Text>}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.label}>Data Plan</Text>
                    <Text style={styles.balanceText}>Balance: ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                </View>
                <TouchableOpacity
                    style={styles.inputContainer}
                    activeOpacity={0.7}
                    onPress={() => !plansLoading && setPlanModalVisible(true)}
                >
                    {plansLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <>
                            <Text style={selectedPlanLabel ? styles.inputText : styles.inputTextMuted}>
                                {selectedPlanLabel || "Select Plan"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneRow}>
                    <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="08x xxx xxxx"
                            placeholderTextColor="#A0ABC0"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>
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
                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/ForgotPinScreen")}>
                    <Text style={styles.forgotText}>Forgot PIN?</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.payBtn, (!selectedPlan || !phone || !pin) && styles.payBtnDisabled]}
                    onPress={handlePurchase}
                    disabled={loading || !selectedPlan}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Pay ₦{selectedPlan?.amount.toLocaleString() || '0'}</Text>}
                </TouchableOpacity>
            </View>

            <DropdownModal
                visible={isPlanModalVisible}
                title="Select Data Plan"
                options={planLabels}
                onSelect={handleSelectPlan}
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
    label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10, marginTop: 20 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20, marginBottom: 10 },
    balanceText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#111" },
    networkRow: { flexDirection: "row", justifyContent: "space-between" },
    networkCard: { width: (width - 40 - 36) / 4, aspectRatio: 1, borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 2 },
    networkSelected: { borderWidth: 2.5, borderColor: COLORS.primary, transform: [{ scale: 1.05 }] },
    networkLabel: { fontSize: 12, fontWeight: "800" },
    inputContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, marginBottom: 16 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111", flex: 1 },
    inputTextMuted: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#A0ABC0", flex: 1 },
    phoneRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    autofillChip: { alignSelf: 'flex-start', backgroundColor: '#E6F0FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: -8, marginBottom: 16 },
    autofillText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: COLORS.primary },
    forgotBtn: { alignSelf: "flex-end" },
    forgotText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnDisabled: { opacity: 0.5 },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
