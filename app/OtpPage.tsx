import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react"
import { useLocalSearchParams } from 'expo-router';
import { useTimer } from 'react-timer-hook'

export default function OtpPage() {
    const { phoneNumber } = useLocalSearchParams()
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    const expiryTime = new Date()
    expiryTime.setSeconds(expiryTime.getSeconds() + 180)
    const { seconds, minutes, isRunning } = useTimer({ expiryTimestamp: expiryTime });
    const maskedNumber = phone
        ? phone.slice(0, -3).replace(/\d/g, '*') + phone.slice(-3)
        : '';


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.backbtncon}>
                <Pressable>
                    <Ionicons name="arrow-back" size={22} color="#4444FF" />
                </Pressable>
                <Text style={styles.otptext}>OTP Verification</Text>
            </View>
            <View>
                <Text>
                    Please Enter{"\n"}
                    OTP Verification
                </Text>
            </View>
            <View>
                <Text>
                    Code was sent to {maskedNumber}
                    This code will expire in
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    backbtncon: {
        flexDirection: 'row',
        gap: 5,
    },

    otptext: {
        color: '#4444FF',
    },
});
