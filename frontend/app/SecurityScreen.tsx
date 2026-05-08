import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function SecurityScreen() {
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
                <Text style={styles.headerTitle}>Security Settings</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="finger-print" size={24} color={COLORS.primary} />
                        <Text style={styles.settingLabel}>Enable Biometric Login</Text>
                    </View>
                    <Ionicons name="toggle" size={32} color={COLORS.primary} />
                </View>

                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="keypad" size={24} color={COLORS.primary} />
                        <Text style={styles.settingLabel}>Require PIN for Transactions</Text>
                    </View>
                    <Ionicons name="toggle" size={32} color={COLORS.primary} />
                </View>

                <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/CreateNewPinScreen" as any)}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="key" size={24} color={COLORS.primary} />
                        <Text style={styles.settingLabel}>Set / Change Transaction PIN</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A0ABC0" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/ChangePasswordScreen" as any)}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
                        <Text style={styles.settingLabel}>Change Password</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A0ABC0" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { paddingHorizontal: 20 },
    settingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    settingLabel: { fontSize: 15, fontFamily: "Poppins_500Medium", color: "#111" },
});
