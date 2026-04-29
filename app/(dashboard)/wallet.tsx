import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
    COLORS,
    VIRTUAL_ACCOUNTS,
    PLACEHOLDER_BALANCE,
} from "@/constants/app-data";
import * as Clipboard from "expo-clipboard";

export default function WalletScreen() {
    const router = useRouter();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

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
                {/* ─── Header ─── */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Wallet</Text>
                    <TouchableOpacity style={styles.headerMenuBtn}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* ─── Virtual Accounts Section ─── */}
                <View style={styles.sectionWrapper}>
                    <Text style={styles.sectionTitle}>Virtual Account:</Text>

                    {VIRTUAL_ACCOUNTS.map((account) => (
                        <View key={account.id} style={styles.accountCard}>
                            <View style={styles.accountCardTop}>
                                <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                                <TouchableOpacity
                                    style={styles.accountCopyBtn}
                                    onPress={() => handleCopyAccount(account.accountNumber, account.id)}
                                >
                                    <Ionicons
                                        name={copiedId === account.id ? "checkmark-circle" : "copy-outline"}
                                        size={20}
                                        color="rgba(255,255,255,0.8)"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.accountCardBottom}>
                                <View>
                                    <Text style={styles.accountBank}>{account.bankName}</Text>
                                    <Text style={styles.accountName}>{account.accountName}</Text>
                                </View>
                                <View style={styles.chargeBadge}>
                                    <Text style={styles.chargeText}>{account.charge}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ─── Quick Actions ─── */}
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

                {/* ─── Transaction History ─── */}
                <View style={styles.transactionsSection}>
                    <Text style={styles.sectionTitleSmall}>Transaction History</Text>
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="wallet-outline" size={40} color="#C5C6FF" />
                        </View>
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your transaction history will appear here once you start using your wallet.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    /* ── Header ── */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
    },
    headerMenuBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceSecondary,
        justifyContent: "center",
        alignItems: "center",
    },

    /* ── Virtual Accounts ── */
    sectionWrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 16,
    },
    accountCard: {
        backgroundColor: COLORS.cardDarkStart,
        borderRadius: 18,
        padding: 20,
        marginBottom: 14,
    },
    accountCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    accountNumber: {
        fontSize: 22,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 1,
    },
    accountCopyBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    accountCardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    accountBank: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: "rgba(255,255,255,0.9)",
        marginBottom: 2,
    },
    accountName: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "rgba(255,255,255,0.6)",
    },
    chargeBadge: {
        backgroundColor: "rgba(255,255,255,0.12)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },
    chargeText: {
        fontSize: 16,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: "rgba(255,255,255,0.9)",
    },

    /* ── Quick Actions ── */
    actionsSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 28,
    },
    actionItem: {
        alignItems: "center",
        gap: 6,
    },
    actionIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 13,
        fontFamily: "Poppins_500Medium",
        fontWeight: "500",
        color: COLORS.textSecondary,
    },

    /* ── Transactions ── */
    transactionsSection: {
        paddingHorizontal: 20,
        marginTop: 28,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
    },
    emptyIconBox: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primaryGhost,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 15,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        fontFamily: "Poppins_400Regular",
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 30,
    },
});
