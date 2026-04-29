import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ForgotPasswordSheet = ({ bottomSheetRef }: { bottomSheetRef: any }) => {
    const snapPoints = useMemo(() => ['40%'], []);
    const router = useRouter();

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.indicator}
        >
            <BottomSheetView style={styles.container}>
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                        bottomSheetRef.current?.dismiss();
                        router.push("/EnterPhoneScreen");
                    }}
                >
                    <View style={styles.iconBox}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
                    </View>
                    <Text style={styles.optionText}>Password reset via SMS</Text>
                    <Ionicons name="chevron-forward" size={20} color="#6366FF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                        bottomSheetRef.current?.dismiss();
                        router.push("/EnterEmailScreen");
                    }}
                >
                    <View style={styles.iconBox}>
                        <Ionicons name="mail-outline" size={24} color="#333" />
                    </View>
                    <Text style={styles.optionText}>Password reset via Email</Text>
                    <Ionicons name="chevron-forward" size={20} color="#6366FF" />
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    sheetBackground: {
        borderRadius: 24,
    },
    indicator: {
        backgroundColor: '#DDDDDD',
        width: 40,
        height: 4,
        marginTop: 10,
    },
    container: {
        paddingHorizontal: 25,
        paddingTop: 15,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconBox: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start', // Align icon slightly better if without background
        marginRight: 10,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
});

export default ForgotPasswordSheet;