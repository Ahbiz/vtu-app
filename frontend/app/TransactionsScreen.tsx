import { COLORS } from "@/constants/app-data";
import apiClient from "@/utils/api";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await apiClient.get('/wallet/transactions');
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Error fetching transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const renderTransaction = ({ item }: { item: any }) => {
        const isCredit = item.type === 'funding' || item.type === 'refund';
        const iconColor = isCredit ? "#00A86B" : "#FF3B30";
        const iconBg = isCredit ? "rgba(0, 168, 107, 0.1)" : "rgba(255, 59, 48, 0.1)";
        const amountPrefix = isCredit ? "+" : "-";

        return (
            <View style={styles.transactionItem}>
                <View style={styles.txLeft}>
                    <View style={[styles.txIconBox, { backgroundColor: iconBg }]}>
                        <Ionicons name={isCredit ? "arrow-down" : "arrow-up"} size={20} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle} numberOfLines={1}>{item.description || item.type}</Text>
                        <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                    </View>
                </View>
                <Text style={[styles.txAmount, { color: isCredit ? "#00A86B" : "#111" }]}>
                    {amountPrefix}₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
            </View>
        );
    };

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

            <View style={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="receipt-outline" size={40} color="#C5C6FF" />
                        </View>
                        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your transaction history will appear here once you start using your wallet.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item._id}
                        renderItem={renderTransaction}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { flex: 1, paddingHorizontal: 20 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, textAlign: "center", lineHeight: 22 },
    transactionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
    txLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
    txIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12, flexShrink: 0 },
    txTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 2, textTransform: "capitalize" },
    txDate: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#888" },
    txAmount: { fontSize: 14, fontFamily: "Poppins_600SemiBold", flexShrink: 0, textAlign: "right" },
});
