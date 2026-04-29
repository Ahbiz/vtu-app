import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function HelpSupportScreen() {
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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Contact Us</Text>

                <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@ahbizpay.com')}>
                    <Ionicons name="mail" size={24} color={COLORS.primary} />
                    <View>
                        <Text style={styles.contactTitle}>Email Support</Text>
                        <Text style={styles.contactDetail}>support@ahbizpay.com</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+2348000000000')}>
                    <Ionicons name="call" size={24} color={COLORS.primary} />
                    <View>
                        <Text style={styles.contactTitle}>Call Us</Text>
                        <Text style={styles.contactDetail}>+234 800 000 0000</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>FAQ</Text>
                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How long does a transfer take?</Text>
                    <Text style={styles.faqAnswer}>Transfers are typically processed instantly. However, network issues may cause slight delays.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#111", marginTop: 20, marginBottom: 10 },
    contactItem: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: COLORS.primaryGhost, borderRadius: 12, marginBottom: 12, gap: 16 },
    contactTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111" },
    contactDetail: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#666" },
    faqItem: { padding: 16, backgroundColor: "#F9F9F9", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#EEE" },
    faqQuestion: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 6 },
    faqAnswer: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#666", lineHeight: 20 },
});
