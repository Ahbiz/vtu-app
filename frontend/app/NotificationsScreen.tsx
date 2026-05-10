import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import apiClient from "@/utils/api";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { COLORS } from "@/constants/app-data";

export default function NotificationsScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ Poppins_600SemiBold, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await apiClient.patch('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.notifItem, !item.isRead && styles.unreadNotif]}
            onPress={() => { if (!item.isRead) handleMarkRead(item._id); }}
            activeOpacity={0.7}
        >
            <View style={[styles.notifIconBox, !item.isRead && styles.unreadIconBox]}>
                <Ionicons name="notifications" size={24} color={item.isRead ? "#A0ABC0" : COLORS.primary} />
            </View>
            <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString('en-NG')}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={styles.backBtn} onPress={handleMarkAllRead}>
                    <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="notifications-off-outline" size={40} color="#C5C6FF" />
                        </View>
                        <Text style={styles.emptyTitle}>No New Notifications</Text>
                        <Text style={styles.emptySubtitle}>
                            You are all caught up! Check back later for updates and offers.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#111" },
    content: { flex: 1, paddingHorizontal: 20 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGhost, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, textAlign: "center", lineHeight: 22 },
    notifItem: { flexDirection: "row", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", alignItems: "center" },
    unreadNotif: { backgroundColor: "#F9FBFF", marginHorizontal: -20, paddingHorizontal: 20 },
    notifIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center", marginRight: 16 },
    unreadIconBox: { backgroundColor: COLORS.primaryGhost },
    notifContent: { flex: 1 },
    notifTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#333", marginBottom: 4 },
    unreadText: { color: COLORS.text },
    notifMessage: { fontSize: 14, fontFamily: "Poppins_400Regular", color: COLORS.textMuted, lineHeight: 20, marginBottom: 6 },
    notifTime: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#A0ABC0" },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginLeft: 10 },
});
