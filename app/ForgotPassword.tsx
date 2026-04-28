import React, { useMemo, } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';

const ForgotPasswordSheet = ({ bottomSheetRef }: { bottomSheetRef: any }) => {
    const snapPoints = useMemo(() => ['30%'], []);
    const router = useRouter()

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
                        <Text style={styles.icon}>💬</Text>
                    </View>
                    <Text style={styles.optionText}>Password reset via SMS</Text>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                        bottomSheetRef.current?.dismiss();
                    }}
                >
                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>✉️</Text>
                    </View>
                    <Text style={styles.optionText}>Password reset via Email</Text>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    sheetBackground: {
        borderRadius: 20
    },
    indicator: {
        backgroundColor: '#ccc',
        width: 40
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 10
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconBox: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 18
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        color: '#222'
    },
    arrow: {
        fontSize: 22,
        color: '#6366FF'
    },
});

export default ForgotPasswordSheet;