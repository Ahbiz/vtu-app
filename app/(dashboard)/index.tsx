import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar,
    FlatList,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    COLORS,
    PLACEHOLDER_USER,
    PLACEHOLDER_BALANCE,
    VIRTUAL_ACCOUNTS,
    SERVICE_ITEMS,
    PROMO_BANNERS,
} from "@/constants/app-data";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const router = useRouter();
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

    if (!fontsLoaded) return null;

    // Use the first virtual account for the quick-access card on dashboard
    const primaryAccount = VIRTUAL_ACCOUNTS[0];

    // Responsive grid
    const gridPadding = 20;
    const gridGap = 12;
    const numColumns = width > 400 ? 4 : 3;
    const itemWidth = (width - gridPadding * 2 - gridGap * (numColumns - 1)) / numColumns;

    // Promo card width for horizontal scroll
    const promoCardWidth = width * 0.72;

    const handleCopyAccount = async (accountNumber: string, id: string) => {
        try {
            await Clipboard.setStringAsync(accountNumber);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // Clipboard not available — silently fail
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
            >
                {/* ─── Header Section ─── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.greetingContainer}>
                            <Text style={styles.greetingName}>Hello {PLACEHOLDER_USER.firstName}</Text>
                            <Text style={styles.greetingSub}>Keep enjoying discounts</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push("/NotificationsScreen")}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.textSecondary} />
                        <View style={styles.notifBadge} />
                    </TouchableOpacity>
                </View>

                {/* ─── Balance Card ─── */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceCardInner}>
                        <View style={styles.balanceTopRow}>
                            <View style={styles.balanceLabelRow}>
                                <Text style={styles.balanceLabel}>Current Balance</Text>
                                <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                                    <Ionicons
                                        name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                                        size={16}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.viewHistoryBtn} onPress={() => router.push("/TransactionsScreen")}>
                                <Text style={styles.viewHistoryText}>View History</Text>
                                <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.balanceAmount}>
                            {balanceVisible
                                ? `${PLACEHOLDER_BALANCE.currency} ${PLACEHOLDER_BALANCE.amount}`
                                : "*** ***"}
                        </Text>
                        <TouchableOpacity style={styles.fundWalletBtn} onPress={() => router.push("/wallet")}>
                            <Text style={styles.fundWalletText}>Fund Wallet</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ─── Quick Account Access ─── */}
                {primaryAccount && (
                    <View style={styles.quickAccountSection}>
                        <TouchableOpacity
                            style={styles.quickAccountCard}
                            activeOpacity={0.8}
                            onPress={() => handleCopyAccount(primaryAccount.accountNumber, "quick")}
                        >
                            <View style={styles.quickAccountLeft}>
                                <View style={styles.bankIconBox}>
                                    <Ionicons name="business-outline" size={18} color={COLORS.surface} />
                                </View>
                                <View>
                                    <Text style={styles.quickAccountBank}>{primaryAccount.bankName}</Text>
                                    <Text style={styles.quickAccountNumber}>{primaryAccount.accountNumber}</Text>
                                </View>
                            </View>
                            <View style={styles.quickAccountRight}>
                                <TouchableOpacity
                                    style={styles.copyBtn}
                                    onPress={() => handleCopyAccount(primaryAccount.accountNumber, "quick")}
                                >
                                    <Ionicons
                                        name={copiedId === "quick" ? "checkmark-outline" : "copy-outline"}
                                        size={16}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.copyBtnText}>
                                        {copiedId === "quick" ? "Copied" : "Copy"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ─── Services Grid ─── */}
                <View style={styles.servicesSection}>
                    <View style={[styles.servicesGrid, { gap: gridGap }]}>
                        {SERVICE_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.serviceItem, { width: itemWidth }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (item.label === "Data") router.push("/DataPurchaseScreen");
                                    else if (item.label === "Airtime") router.push("/AirtimePurchaseScreen");
                                    else if (item.label === "Electricity") router.push("/ElectricityBillScreen");
                                    else if (item.label === "Cable TV") router.push("/CableTVScreen");
                                    else if (item.label === "Recharge2Cash") router.push("/Recharge2CashScreen");
                                    else if (item.label === "Exam") router.push("/ExamPinScreen");
                                    else if (item.label === "Recharge Card") router.push("/RechargeCardScreen");
                                    else if (item.label === "Data Card") router.push("/DataCardScreen");
                                    else if (item.label === "Refer & Earn") router.push("/ReferEarnScreen");
                                }}
                            >
                                <View style={[styles.serviceIconBox, { backgroundColor: item.color + "14" }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <Text style={styles.serviceLabel} numberOfLines={1}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ─── Promo Banners (Horizontal Scroll) ─── */}
                <View style={styles.promoSection}>
                    <FlatList
                        data={PROMO_BANNERS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.promoListContent}
                        snapToInterval={promoCardWidth + 12}
                        decelerationRate="fast"
                        renderItem={({ item }) => {
                            const handlePromoPress = () => {
                                if (item.id === "1") router.push("/ReferEarnScreen");
                                else if (item.id === "2") router.push("/DataPurchaseScreen");
                                else if (item.id === "3") router.push("/AirtimePurchaseScreen");
                                else if (item.id === "4") router.push("/ElectricityBillScreen");
                            };
                            return (
                                <TouchableOpacity
                                    style={[styles.promoCard, { width: promoCardWidth, backgroundColor: item.bgColor }]}
                                    activeOpacity={0.8}
                                    onPress={handlePromoPress}
                                >
                                <View style={[styles.promoIconWrapper, { backgroundColor: COLORS.surface }]}>
                                    <Ionicons name={item.icon} size={24} color={item.iconColor} />
                                </View>
                                <View style={styles.promoTextWrapper}>
                                    <Text style={styles.promoTitle}>{item.title}</Text>
                                    <Text style={styles.promoSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={item.iconColor} />
                            </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                {/* ─── Recent Transactions ─── */}
                <View style={styles.transactionsSection}>
                    <View style={styles.transactionsHeader}>
                        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => router.push("/TransactionsScreen")}>
                            <Text style={styles.viewMoreText}>View More</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="receipt-outline" size={40} color="#C5C6FF" />
                        </View>
                        <Text style={styles.emptyTitle}>No Transaction Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Looks like there's no recent activity to show here.{"\n"}
                            Get started by making a transaction
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
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
    },
    greetingContainer: {
        gap: 2,
    },
    greetingName: {
        fontSize: 18,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
    },
    greetingSub: {
        fontSize: 13,
        fontFamily: "Poppins_400Regular",
        color: COLORS.textMuted,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surfaceSecondary,
        justifyContent: "center",
        alignItems: "center",
    },
    notifBadge: {
        position: "absolute",
        top: 12,
        right: 13,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.danger,
        borderWidth: 1.5,
        borderColor: COLORS.surface,
    },

    /* ── Balance Card ── */
    balanceCard: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
        backgroundColor: COLORS.surface,
    },
    balanceCardInner: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 22,
    },
    balanceTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    balanceLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    balanceLabel: {
        fontSize: 13,
        fontFamily: "Poppins_500Medium",
        color: "rgba(255,255,255,0.8)",
    },
    viewHistoryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    viewHistoryText: {
        fontSize: 13,
        fontFamily: "Poppins_500Medium",
        color: "rgba(255,255,255,0.8)",
    },
    balanceAmount: {
        fontSize: 30,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    fundWalletBtn: {
        alignSelf: "flex-end",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 12,
    },
    fundWalletText: {
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.primary,
    },

    /* ── Quick Account Access ── */
    quickAccountSection: {
        paddingHorizontal: 20,
        paddingBottom: 8,
        backgroundColor: COLORS.surface,
    },
    quickAccountCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.primaryLight,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    quickAccountLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    bankIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    quickAccountBank: {
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        color: COLORS.textMuted,
    },
    quickAccountNumber: {
        fontSize: 16,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
    },
    quickAccountRight: {
        alignItems: "flex-end",
    },
    copyBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    copyBtnText: {
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        color: COLORS.primary,
    },

    /* ── Services Grid ── */
    servicesSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    servicesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    serviceItem: {
        alignItems: "center",
        paddingVertical: 12,
    },
    serviceIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    serviceLabel: {
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        fontWeight: "500",
        color: COLORS.textSecondary,
        textAlign: "center",
    },

    /* ── Promo Banners ── */
    promoSection: {
        marginTop: 20,
    },
    promoListContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    promoCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    promoIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    promoTextWrapper: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 13,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.text,
    },
    promoSubtitle: {
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        color: COLORS.textMuted,
        marginTop: 2,
    },

    /* ── Recent Transactions ── */
    transactionsSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    transactionsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    transactionsTitle: {
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.primary,
    },
    viewMoreText: {
        fontSize: 13,
        fontFamily: "Poppins_500Medium",
        color: COLORS.primary,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 36,
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
        color: COLORS.danger,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        fontFamily: "Poppins_400Regular",
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});
