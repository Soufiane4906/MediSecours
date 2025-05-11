import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation, route }) {
    const username = route?.params?.username || 'Utilisateur';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bonjour {username}</Text>
            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                    <Image source={require('../assets/ambulance.png')} style={styles.icon} />
                    <Text>Ambulance</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                    <Image source={require('../assets/hospital.png')} style={styles.icon} />
                    <Text>Hôpital</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', alignItems:'center' },
    title: { fontSize:24, marginBottom:30 },
    iconsContainer: { flexDirection:'row', justifyContent:'space-around', width:'80%' },
    icon: { width:80, height:80, marginBottom:10 }
});
