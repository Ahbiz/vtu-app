import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { APP_BRAND, COLORS } from "@/constants/app-data";

export default function AboutScreen() {
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
                <Text style={styles.headerTitle}>About</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>{APP_BRAND.letterMark}</Text>
                    </View>
                    <Text style={styles.appName}>{APP_BRAND.name}</Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.description}>
                        {APP_BRAND.name} is a comprehensive digital platform designed to make bill payments, airtime purchases, and fund transfers seamless and secure.
                    </Text>
                    
                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkLabel}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A0ABC0" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkLabel}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A0ABC0" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>© 2026 {APP_BRAND.name}. All rights reserved.</Text>
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
    logoContainer: { alignItems: "center", marginVertical: 40 },
    logoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    logoText: { fontSize: 40, fontFamily: "Poppins_700Bold", color: "#FFF" },
    appName: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#111", marginBottom: 4 },
    versionText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#666" },
    infoSection: { backgroundColor: "#F9F9F9", borderRadius: 16, padding: 20, marginBottom: 40 },
    description: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#444", lineHeight: 22, textAlign: "center", marginBottom: 30 },
    linkItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#E0E0E0" },
    linkLabel: { fontSize: 15, fontFamily: "Poppins_500Medium", color: "#111" },
    footerText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#888", textAlign: "center" },
});
