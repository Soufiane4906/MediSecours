import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as Notifications from 'expo-notifications';

export default function CalendarScreen() {
    const [selected, setSelected] = useState('');

    useEffect(() => {
        Notifications.requestPermissionsAsync();
    }, []);

    const onDayPress = day => {
        setSelected(day.dateString);
        // Planifier une notification la veille
        const date = new Date(day.dateString);
        date.setDate(date.getDate() - 1);
        Notifications.scheduleNotificationAsync({
            content: {
                title: "Rappel",
                body: `Rendez-vous demain (${day.dateString})`,
            },
            trigger: date,
        });
        Alert.alert('Notification programmée', `Vous serez notifié la veille de ${day.dateString}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calendrier</Text>
            <Calendar
                onDayPress={onDayPress}
                markedDates={{
                    [selected]: { selected: true, marked: true }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, padding:20 },
    title: { fontSize:24, marginBottom:20 }
});