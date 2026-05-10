import { COLORS } from "@/constants/app-data";
import apiClient from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneNumberInput, { PhoneNumberInputRef } from '../components/PhoneNumberInput';

/**
 * EditProfileScreen — allows authenticated users to update their profile.
 * Calls PUT /api/auth/profile with { firstName, lastName, phone }.
 * Email is read-only (cannot be changed per business rules).
 */
export default function EditProfileScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [localPhone, setLocalPhone] = useState("");
    const [formattedPhone, setFormattedPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const phoneRef = useRef<PhoneNumberInputRef>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                setFirstName(response.data.firstName || '');
                setLastName(response.data.lastName || '');
                setEmail(response.data.email || '');
                setLocalPhone(response.data.phone || '');
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Error", "First name and last name are required.");
            return;
        }

        const checkValid = phoneRef.current?.isValidNumber(localPhone);
        if (!checkValid) {
            Alert.alert("Validation Error", "Please enter a valid phone number.");
            return;
        }

        try {
            setLoading(true);
            await apiClient.put('/auth/profile', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: formattedPhone,
            });
            Alert.alert("Success", "Profile updated successfully.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update profile.';
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

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
                    </View>
                </View>

                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First name"
                        placeholderTextColor="#A0ABC0"
                    />
                </View>

                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last name"
                        placeholderTextColor="#A0ABC0"
                    />
                </View>

                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: '#EFEFEF' }]}>
                    <TextInput
                        style={[styles.input, { color: '#999' }]}
                        value={email}
                        editable={false}
                    />
                </View>

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneWrapper}>
                    <PhoneNumberInput
                        ref={phoneRef}
                        defaultCode="NG"
                        defaultValue={localPhone}
                        onChangeText={setLocalPhone}
                        onChangeFormattedText={setFormattedPhone}
                        placeholder="801 234 5678"
                        containerStyle={styles.phoneContainer}
                    />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
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
    label: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#444", marginBottom: 8 },
    inputContainer: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: "center", marginBottom: 20 },
    input: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#111" },
    phoneWrapper: { marginBottom: 20 },
    phoneContainer: {
        borderBottomWidth: 0,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
    },
    saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 20 },
    saveBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
});
