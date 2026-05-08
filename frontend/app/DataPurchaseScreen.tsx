import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    Dimensions,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "@/utils/api";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";
import DropdownModal from "@/components/DropdownModal";

const { width } = Dimensions.get("window");

export default function DataPurchaseScreen() {
    const router = useRouter();
    const [selectedNetwork, setSelectedNetwork] = useState<string>("MTN");
    const [dataPlan, setDataPlan] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);

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

    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

    if (!fontsLoaded) return null;

    const networks = [
        { id: "MTN", color: "#FFCC00" },
        { id: "AIRTEL", color: "#E3000F" },
        { id: "GLO", color: "#009900" },
        { id: "9MOBILE", color: "#1E1E1E" },
    ];

    const NETWORK_MAP: Record<string, number> = {
        "MTN": 1,
        "AIRTEL": 2,
        "GLO": 3,
        "9MOBILE": 4
    };

    const DATA_PLANS: Record<string, { label: string, id: number, amount: number }[]> = {
        "MTN": [
            { label: "500MB SME - 1 Month (₦390)", id: 4, amount: 390 },
            { label: "1GB SME - 1 Month (₦500)", id: 5, amount: 500 },
            { label: "2GB SME - 1 Month (₦1,200)", id: 6, amount: 1200 },
            { label: "3GB SME - 1 Month (₦1,800)", id: 7, amount: 1800 },
            { label: "5GB SME - 1 Month (₦3,000)", id: 8, amount: 3000 },
        ],
        "GLO": [
            { label: "1.5GB GIFTING - 1 Month (₦465)", id: 24, amount: 465 },
            { label: "2.9GB GIFTING - 1 Month (₦940)", id: 25, amount: 940 },
            { label: "4.1GB GIFTING - 1 Month (₦1,300)", id: 26, amount: 1300 },
            { label: "5.8GB GIFTING - 1 Month (₦1,860)", id: 27, amount: 1860 },
            { label: "10GB GIFTING - 1 Month (₦3,020)", id: 28, amount: 3020 },
        ],
        "9MOBILE": [
            { label: "500MB GIFTING - 1 Month (₦450)", id: 34, amount: 450 },
            { label: "1.1GB SME - 1 Month (₦399)", id: 29, amount: 399 },
            { label: "1.5GB GIFTING - 1 Month (₦900)", id: 33, amount: 900 },
            { label: "2GB SME - 1 Month (₦760)", id: 30, amount: 760 },
        ],
        "AIRTEL": [
            { label: "1GB SME - 1 Month (₦500)", id: 10, amount: 500 },
            { label: "2GB SME - 1 Month (₦1000)", id: 11, amount: 1000 },
            { label: "5GB SME - 1 Month (₦2500)", id: 12, amount: 2500 },
        ]
    };

    const currentPlans = DATA_PLANS[selectedNetwork] || [];
    const currentPlanLabels = currentPlans.map(p => p.label);

    const handleNetworkChange = (netId: string) => {
        setSelectedNetwork(netId);
        setDataPlan("");
    };

    const handlePurchase = async () => {
        if (!selectedNetwork || !dataPlan || !phone || !pin) {
            Alert.alert("Error", "Please fill in all fields including your PIN.");
            return;
        }

        const selectedPlanData = currentPlans.find(p => p.label === dataPlan);
        if (!selectedPlanData) {
            Alert.alert("Error", "Invalid data plan selected.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/vtu/data', {
                network: NETWORK_MAP[selectedNetwork],
                phone: phone.trim(),
                dataPlan: selectedPlanData.id,
                amount: selectedPlanData.amount,
                pin: pin.trim()
            });

            Alert.alert("Success", "Data purchase successful!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Data purchase failed. Please try again.';
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data Purchase</Text>
                <TouchableOpacity style={styles.notifBtn}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.label}>Select Network</Text>
                <View style={styles.networkRow}>
                    {networks.map(net => (
                        <TouchableOpacity
                            key={net.id}
                            style={[
                                styles.networkCard,
                                { backgroundColor: net.color },
                                selectedNetwork === net.id && styles.networkSelected
                            ]}
                            onPress={() => handleNetworkChange(net.id)}
                            activeOpacity={0.8}
                        >
                            {net.id === "MTN" && <View style={styles.mtnLogo}><Text style={styles.mtnText}>MTN</Text></View>}
                            {net.id === "AIRTEL" && <View style={styles.airtelLogo}><Text style={styles.airtelText}>airtel</Text></View>}
                            {net.id === "GLO" && <View style={styles.gloLogo}><Text style={styles.gloText}>glo</Text></View>}
                            {net.id === "9MOBILE" && (
                                <View style={styles.nineMobileLogo}>
                                    <Text style={styles.nineMobileTextMain}>9</Text>
                                    <Text style={styles.nineMobileTextSub}>mobile</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.label}>Data Plans</Text>
                    <Text style={styles.balanceText}>Balance: ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.inputContainerDropdown} 
                    activeOpacity={0.7}
                    onPress={() => setPlanModalVisible(true)}
                >
                    <Text style={dataPlan ? styles.inputText : styles.inputTextMuted}>
                        {dataPlan || "Select Plan"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#A0ABC0" />
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
                    <TouchableOpacity style={styles.contactBtn}>
                        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
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
                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/ForgotPinScreen")}>
                    <Text style={styles.forgotText}>Forgot PIN?</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.payBtn} onPress={handlePurchase} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payBtnText}>Pay</Text>
                    )}
                </TouchableOpacity>
            </View>

            <DropdownModal 
                visible={isPlanModalVisible}
                title="Select Data Plan"
                options={currentPlanLabels}
                onSelect={setDataPlan}
                onClose={() => setPlanModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    notifBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-end" },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10, marginTop: 20 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20, marginBottom: 10 },
    balanceText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#111" },
    networkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    networkCard: { width: (width - 40 - 36) / 4, aspectRatio: 1, borderRadius: 12, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    networkSelected: { borderWidth: 2, borderColor: COLORS.primary, transform: [{ scale: 1.05 }] },
    mtnLogo: { width: "80%", height: "50%", backgroundColor: "#FFCC00", borderWidth: 1.5, borderColor: "#000", borderRadius: 20, justifyContent: "center", alignItems: "center" },
    mtnText: { fontSize: 10, fontWeight: "900", color: "#000", fontStyle: "italic" },
    airtelLogo: { justifyContent: "center", alignItems: "center" },
    airtelText: { fontSize: 14, fontWeight: "900", color: "#FFF", fontStyle: "italic" },
    gloLogo: { width: 40, height: 40, backgroundColor: "#009900", borderRadius: 20, borderWidth: 2, borderColor: "#FFF", justifyContent: "center", alignItems: "center" },
    gloText: { fontSize: 14, fontWeight: "bold", color: "#FFF", fontStyle: "italic" },
    nineMobileLogo: { flexDirection: "row", alignItems: "baseline" },
    nineMobileTextMain: { fontSize: 24, fontWeight: "900", color: "#009900" },
    nineMobileTextSub: { fontSize: 10, fontWeight: "bold", color: "#FFF" },
    inputContainer: { backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, justifyContent: "center", marginBottom: 16 },
    inputContainerDropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, marginBottom: 16 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    inputTextMuted: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#A0ABC0" },
    phoneRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    contactBtn: { width: 54, height: 54, backgroundColor: "#E6F0FF", borderRadius: 10, justifyContent: "center", alignItems: "center" },
    forgotBtn: { alignSelf: "flex-end" },
    forgotText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#111" },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    payBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    payBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
