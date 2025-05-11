// components/AppButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import theme from '../theme';

export default function AppButton({ title, onPress, type = 'primary', icon }) {
    return (
        <TouchableOpacity
            style={[styles.button, styles[type]]}
            onPress={onPress}
        >
            {icon}
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: theme.spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    primary: {
        backgroundColor: theme.colors.primary
    },
    secondary: {
        backgroundColor: theme.colors.secondary
    },
    danger: {
        backgroundColor: theme.colors.danger
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: icon ? theme.spacing.xs : 0
    }
});
