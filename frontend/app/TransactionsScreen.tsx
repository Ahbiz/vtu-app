import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function TransactionsScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <TouchableOpacity style={styles.backBtn}>
                    <Ionicons name="search" size={20} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="receipt-outline" size={40} color="#C5C6FF" />
                    </View>
                    <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Your transaction history will appear here once you start using your wallet.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, textAlign: "center", lineHeight: 22 },
});
