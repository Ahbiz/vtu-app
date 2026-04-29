import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from "expo-router"
export default function SmsReset() {
    const router = useRouter()
    const { phoneNumber } = useLocalSearchParams()
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <View>
                <Text>Forgot Password?</Text>
                <Text>Please enter the code sent to {phone}</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    backButton: {
        backgroundColor: '#1E90FF',
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center"
    }
})