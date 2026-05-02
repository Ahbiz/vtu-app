import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, PLACEHOLDER_USER } from "@/constants/app-data";

export default function EditProfileScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={40} color={COLORS.primary} />
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} defaultValue={PLACEHOLDER_USER.fullName} />
                </View>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} defaultValue={PLACEHOLDER_USER.email} keyboardType="email-address" />
                </View>

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} defaultValue={PLACEHOLDER_USER.phone} keyboardType="phone-pad" />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
    avatarSection: { alignItems: "center", marginBottom: 30 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
    editAvatarBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
    label: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#444", marginBottom: 8 },
    inputContainer: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: "center", marginBottom: 20 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 20 },
    saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
});
