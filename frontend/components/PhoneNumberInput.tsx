import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

export interface PhoneNumberInputRef {
    isValidNumber: (number: string) => boolean;
}

interface PhoneNumberInputProps {
    defaultCode?: CountryCode;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    onChangeFormattedText?: (text: string) => void;
    containerStyle?: object;
    textInputProps?: TextInputProps;
    placeholder?: string;
}

/**
 * Custom phone input — single unified box with flag, calling code, and number input.
 * Replaces react-native-phone-number-input to get full layout control.
 */
const PhoneNumberInput = forwardRef<PhoneNumberInputRef, PhoneNumberInputProps>(
    (
        {
            defaultCode = 'NG',
            defaultValue = '',
            onChangeText,
            onChangeFormattedText,
            containerStyle,
            textInputProps,
            placeholder = '801 234 5678',
        },
        ref
    ) => {
        const [countryCode, setCountryCode] = useState<CountryCode>(defaultCode);
        const [callingCode, setCallingCode] = useState('234');
        const [number, setNumber] = useState(defaultValue);
        const [pickerVisible, setPickerVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            isValidNumber: (num: string) => {
                const cleaned = num.replace(/\D/g, '');
                return cleaned.length >= 7 && cleaned.length <= 15;
            },
        }));

        const onSelectCountry = (country: Country) => {
            setCountryCode(country.cca2);
            const code = country.callingCode?.[0] ?? callingCode;
            setCallingCode(code);
            setPickerVisible(false);
            const formatted = `+${code}${number.replace(/^0/, '')}`;
            onChangeFormattedText?.(formatted);
        };

        const handleChangeText = (text: string) => {
            setNumber(text);
            onChangeText?.(text);
            const cleaned = text.replace(/^0/, '');
            onChangeFormattedText?.(`+${callingCode}${cleaned}`);
        };

        return (
            <View style={[styles.container, containerStyle]}>
                <TouchableOpacity
                    style={styles.flagSection}
                    onPress={() => setPickerVisible(true)}
                    activeOpacity={0.7}
                >
                    <CountryPicker
                        countryCode={countryCode}
                        withFlag
                        withCallingCode
                        withFilter
                        withModal
                        visible={pickerVisible}
                        onSelect={onSelectCountry}
                        onClose={() => setPickerVisible(false)}
                    />
                    <Text style={styles.callingCode}>+{callingCode}</Text>
                    <Ionicons name="chevron-down" size={14} color="#888" style={{ marginLeft: 2 }} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TextInput
                    style={styles.textInput}
                    value={number}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#AAAAAA"
                    keyboardType="phone-pad"
                    {...textInputProps}
                />
            </View>
        );
    }
);

PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        height: 48,
    },
    flagSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    callingCode: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111111',
        marginLeft: 4,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#111111',
        paddingVertical: 0,
        height: 48,
    },
});
