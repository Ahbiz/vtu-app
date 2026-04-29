import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { COLORS, PLACEHOLDER_USER } from "@/constants/app-data";

const MENU_ITEMS = [
    { id: "1", icon: "person-outline" as const, label: "Edit Profile", route: "/EditProfileScreen", chevron: true },
    { id: "2", icon: "lock-closed-outline" as const, label: "Change Password", route: "/ChangePasswordScreen", chevron: true },
    { id: "3", icon: "notifications-outline" as const, label: "Notifications", route: "/NotificationsScreen", chevron: true },
    { id: "4", icon: "shield-checkmark-outline" as const, label: "Security", route: "/SecurityScreen", chevron: true },
    { id: "5", icon: "help-circle-outline" as const, label: "Help & Support", route: "/HelpSupportScreen", chevron: true },
    { id: "6", icon: "information-circle-outline" as const, label: "About", route: "/AboutScreen", chevron: true },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

    if (!fontsLoaded) return null;

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => router.replace("/LoginScreen" as any),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>


                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.userName}>{PLACEHOLDER_USER.fullName}</Text>
                    <Text style={styles.userEmail}>{PLACEHOLDER_USER.email}</Text>
                </View>


                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem} 
                            activeOpacity={0.6}
                            onPress={() => item.route ? router.push(item.route as any) : null}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            {item.chevron && (
                                <Ionicons name="chevron-forward" size={18} color={COLORS.textPlaceholder} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>


                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
    },
    avatarSection: {
        alignItems: "center",
        paddingVertical: 28,
        backgroundColor: COLORS.surface,
        marginBottom: 12,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    userName: {
        fontSize: 20,
        fontFamily: "Poppins_700Bold",
        fontWeight: "700",
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: COLORS.textMuted,
        marginTop: 2,
    },
    menuSection: {
        marginHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primaryGhost,
        justifyContent: "center",
        alignItems: "center",
    },
    menuLabel: {
        fontSize: 15,
        fontFamily: "Poppins_500Medium",
        fontWeight: "500",
        color: COLORS.textSecondary,
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 16,
        backgroundColor: "#FEF2F2",
        borderRadius: 16,
    },
    logoutText: {
        fontSize: 15,
        fontFamily: "Poppins_600SemiBold",
        fontWeight: "600",
        color: COLORS.danger,
    },
});
