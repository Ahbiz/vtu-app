import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";

export default function ReferEarnScreen() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const referralCode = "AHBIZ-2026";
    
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    if (!fontsLoaded) return null;

    const copyCode = async () => {
        await Clipboard.setStringAsync(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refer & Earn</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="gift" size={80} color={COLORS.primary} />
                </View>
                
                <Text style={styles.title}>Invite Friends & Earn</Text>
                <Text style={styles.subtitle}>
                    Share your referral code with your friends. Once they register and make their first transaction, you both earn N500!
                </Text>

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Your Referral Code</Text>
                    <View style={styles.codeRow}>
                        <Text style={styles.codeText}>{referralCode}</Text>
                        <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
                            <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={20} color={COLORS.primary} />
                            <Text style={styles.copyBtnText}>{copied ? "Copied" : "Copy"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.shareBtn}>
                    <Text style={styles.shareBtnText}>Share Link</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { paddingHorizontal: 20, paddingBottom: 40, alignItems: "center" },
    iconWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center", marginVertical: 30 },
    title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#111", marginBottom: 12 },
    subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#666", textAlign: "center", paddingHorizontal: 20, marginBottom: 40, lineHeight: 22 },
    codeContainer: { width: "100%", backgroundColor: "#F5F5F5", borderRadius: 16, padding: 20, borderStyle: "dashed", borderWidth: 1, borderColor: COLORS.border },
    codeLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#666", marginBottom: 8, textAlign: "center" },
    codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    codeText: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#111", letterSpacing: 2 },
    copyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
    copyBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: COLORS.primary },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    shareBtn: { backgroundColor: "#0052CC", height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    shareBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
