import { COLORS } from "@/constants/app-data";
import apiClient from "@/utils/api";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VirtualAccount {
    accountNumber: string;
    accountName: string;
    bankName: string;
}

export default function WalletScreen() {
    const router = useRouter();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

    // Re-fetch profile every time this screen gains focus.
    // This ensures the balance updates after returning from FundWalletScreen.
    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                try {
                    const response = await apiClient.get('/auth/me');
                    setVirtualAccount(response.data.virtualAccount || null);
                    setWalletBalance(response.data.walletBalance || 0);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                }
            };

            const fetchTransactions = async () => {
                try {
                    const response = await apiClient.get('/wallet/transactions?limit=5');
                    setRecentTransactions(response.data.transactions);
                } catch (error) {
                    console.error("Failed to fetch transactions:", error);
                } finally {
                    setLoadingTx(false);
                }
            };

            fetchProfile();
            fetchTransactions();
        }, [])
    );

    const renderTransaction = (item: any) => {
        const isCredit = item.type === 'funding' || item.type === 'refund';
        const iconColor = isCredit ? "#00A86B" : "#FF3B30";
        const iconBg = isCredit ? "rgba(0, 168, 107, 0.1)" : "rgba(255, 59, 48, 0.1)";
        const amountPrefix = isCredit ? "+" : "-";

        return (
            <View key={item._id} style={styles.transactionItem}>
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

    const handleCopyAccount = async (accountNumber: string, id: string) => {
        try {
            await Clipboard.setStringAsync(accountNumber);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            Alert.alert("Copied", `Account number ${accountNumber} copied!`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Wallet</Text>
                    <TouchableOpacity style={styles.headerMenuBtn}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.balanceSection}>
                    <Text style={styles.balanceLabel}>Wallet Balance</Text>
                    <Text style={styles.balanceAmount}>₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.sectionWrapper}>
                    <Text style={styles.sectionTitle}>Virtual Account</Text>
                    <Text style={styles.sectionSubtitle}>Transfer to this account to fund your wallet instantly</Text>

                    {virtualAccount ? (
                        <View style={styles.accountCard}>
                            <View style={styles.accountCardTop}>
                                <Text style={styles.accountNumber}>{virtualAccount.accountNumber}</Text>
                                <TouchableOpacity
                                    style={styles.accountCopyBtn}
                                    onPress={() => handleCopyAccount(virtualAccount.accountNumber, 'dva')}
                                >
                                    <Ionicons
                                        name={copiedId === 'dva' ? "checkmark-circle" : "copy-outline"}
                                        size={20}
                                        color="rgba(255,255,255,0.8)"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.accountCardBottom}>
                                <View>
                                    <Text style={styles.accountBank}>{virtualAccount.bankName}</Text>
                                    <Text style={styles.accountName}>{virtualAccount.accountName}</Text>
                                </View>
                                <View style={styles.chargeBadge}>
                                    <Text style={styles.chargeText}>Instant</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noAccountCard}>
                            <Ionicons name="card-outline" size={32} color={COLORS.textMuted} />
                            <Text style={styles.noAccountText}>Virtual account not yet assigned</Text>
                            <Text style={styles.noAccountSubtext}>This is set up automatically after registration. Please try logging out and back in.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitleSmall}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/FundWalletScreen")}>
                            <View style={styles.actionIconBox}>
                                <Ionicons name="add-outline" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Fund</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/TransferScreen")}>
                            <View style={styles.actionIconBox}>
                                <Ionicons name="arrow-up-outline" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Transfer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/TransactionsScreen")}>
                            <View style={styles.actionIconBox}>
                                <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.actionLabel}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.transactionsSection}>
                    <Text style={styles.sectionTitleSmall}>Recent Transactions</Text>
                    {loadingTx ? (
                        <View style={{ paddingVertical: 40, alignItems: "center" }}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="wallet-outline" size={40} color="#C5C6FF" />
                            </View>
                            <Text style={styles.emptyTitle}>No transactions yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Your transaction history will appear here once you start using your wallet.
                            </Text>
                        </View>
                    ) : (
                        <View style={{ marginTop: 8 }}>
                            {recentTransactions.map(renderTransaction)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, backgroundColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold", fontWeight: "700", color: COLORS.text },
    headerMenuBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, justifyContent: "center", alignItems: "center" },
    balanceSection: { backgroundColor: COLORS.primary, marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 20 },
    balanceLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.8)", marginBottom: 6 },
    balanceAmount: { fontSize: 28, fontFamily: "Poppins_700Bold", fontWeight: "700", color: "#FFFFFF" },
    sectionWrapper: { paddingHorizontal: 20, paddingTop: 24 },
    sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", fontWeight: "700", color: COLORS.text, marginBottom: 4 },
    sectionSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, marginBottom: 16 },
    accountCard: { backgroundColor: COLORS.cardDarkStart, borderRadius: 18, padding: 20, marginBottom: 14 },
    accountCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    accountNumber: { fontSize: 22, fontFamily: "Poppins_700Bold", fontWeight: "700", color: "#FFFFFF", letterSpacing: 1 },
    accountCopyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center" },
    accountCardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    accountBank: { fontSize: 16, fontFamily: "Poppins_600SemiBold", fontWeight: "600", color: "rgba(255,255,255,0.9)", marginBottom: 2 },
    accountName: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
    chargeBadge: { backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    chargeText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", fontWeight: "600", color: "rgba(255,255,255,0.9)" },
    noAccountCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed" },
    noAccountText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: COLORS.textSecondary, marginTop: 12, marginBottom: 6 },
    noAccountSubtext: { fontSize: 12, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, textAlign: "center", lineHeight: 18 },
    actionsSection: { paddingHorizontal: 20, paddingTop: 24 },
    sectionTitleSmall: { fontSize: 16, fontFamily: "Poppins_600SemiBold", fontWeight: "600", color: COLORS.text, marginBottom: 16 },
    actionsRow: { flexDirection: "row", justifyContent: "center", gap: 28 },
    actionItem: { alignItems: "center", gap: 6 },
    actionIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
    actionLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", fontWeight: "500", color: COLORS.textSecondary },
    transactionsSection: { paddingHorizontal: 20, marginTop: 28 },
    emptyState: { alignItems: "center", paddingVertical: 40, backgroundColor: COLORS.surface, borderRadius: 16 },
    emptyIconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6 },
    emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, textAlign: "center", lineHeight: 20, paddingHorizontal: 30 },
    transactionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
    txLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
    txIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12, flexShrink: 0 },
    txTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 2, textTransform: "capitalize" },
    txDate: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#888" },
    txAmount: { fontSize: 14, fontFamily: "Poppins_600SemiBold", flexShrink: 0, textAlign: "right" },
});
