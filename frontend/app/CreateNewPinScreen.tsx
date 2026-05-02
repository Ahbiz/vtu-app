import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function CreateNewPinScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    if (!fontsLoaded) return null;

    const handleSave = () => {

        router.replace("/(dashboard)");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New PIN</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBox}>
                        <Ionicons name="lock-closed-outline" size={40} color={COLORS.primary} />
                    </View>
                </View>

                <Text style={styles.title}>Set New Transaction PIN</Text>
                <Text style={styles.subtitle}>
                    Create a new 4-digit PIN for your transactions. Please don't share this PIN with anyone.
                </Text>

                <Text style={styles.label}>New PIN</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••" 
                        placeholderTextColor="#A0ABC0" 
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={4}
                        value={newPin}
                        onChangeText={setNewPin}
                    />
                </View>

                <Text style={styles.label}>Confirm New PIN</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••" 
                        placeholderTextColor="#A0ABC0" 
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={4}
                        value={confirmPin}
                        onChangeText={setConfirmPin}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save New PIN</Text>
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
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    iconContainer: { alignItems: "center", marginTop: 10, marginBottom: 24 },
    iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#111", textAlign: "center", marginBottom: 10 },
    subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#666", textAlign: "center", marginBottom: 32, lineHeight: 22 },
    label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#111", marginBottom: 10 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#E6F0FF", borderRadius: 10, paddingHorizontal: 16, height: 54, marginBottom: 16 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    bottomContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
    saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
