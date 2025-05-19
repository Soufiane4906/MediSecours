import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>الإعدادات</Text>
            <Text style={styles.text}>لا توجد إعدادات متاحة حالياً.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    text: { fontSize: 16, color: '#666' }
});

