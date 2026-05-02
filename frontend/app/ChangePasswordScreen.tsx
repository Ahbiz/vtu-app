import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { COLORS } from "@/constants/app-data";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>Create a new, strong password that you don't use for other websites.</Text>

                <Text style={styles.label}>Old Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry={!oldPasswordVisible} 
                        placeholder="••••••••" 
                        placeholderTextColor="#A0ABC0"
                    />
                    <TouchableOpacity onPress={() => setOldPasswordVisible(!oldPasswordVisible)}>
                        <Ionicons name={oldPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#A0ABC0" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry={!newPasswordVisible} 
                        placeholder="••••••••" 
                        placeholderTextColor="#A0ABC0"
                    />
                    <TouchableOpacity onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
                        <Ionicons name={newPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#A0ABC0" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry={!newPasswordVisible} 
                        placeholder="••••••••" 
                        placeholderTextColor="#A0ABC0"
                    />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
                    <Text style={styles.saveBtnText}>Update Password</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { padding: 20 },
    description: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#666", marginBottom: 30 },
    label: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#444", marginBottom: 8 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, height: 56, marginBottom: 20 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 20 },
    saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
});
