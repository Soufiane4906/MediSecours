import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const staticProviders = [
    { id: 1, name: 'Ambulance Casablanca', latitude: 33.5731, longitude: -7.5898 },
    { id: 2, name: 'Ambulance Rabat', latitude: 34.0209, longitude: -6.8416 }
];

const casablanca = { latitude: 33.5731, longitude: -7.5898 };
const rabat = { latitude: 34.0209, longitude: -6.8416 };

export default function MapScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [userLocation, setUserLocation] = useState(casablanca);

    useEffect(() => {
        setTimeout(() => {
            setProviders(staticProviders);
            setLoading(false);

            // Appel automatique du plus proche
            Alert.alert('Appel en cours', `Appel gratuit à ${staticProviders[0].name}`);
            setTimeout(() => {
                navigation.navigate('Map', { enRoute: true });
            }, 2000);
        }, 2000);
    }, []);

    const enRoute = navigation.getState().routes.find(r => r.name === 'Map')?.params?.enRoute;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 33.796,
                    longitude: -7.215,
                    latitudeDelta: 1.2,
                    longitudeDelta: 1.2,
                }}
            >
                <Marker coordinate={userLocation} title="Vous (Casablanca)" />
                {providers.map(p => (
                    <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} title={p.name} />
                ))}
                {/* Affiche une route simulée entre Casablanca et Rabat */}
                {enRoute && (
                    <Polyline
                        coordinates={[casablanca, rabat]}
                        strokeColor="#007AFF"
                        strokeWidth={4}
                    />
                )}
            </MapView>
            {loading && <Text style={styles.status}>En cours de recherche...</Text>}
            {!loading && !enRoute && <Text style={styles.status}>Appel gratuit</Text>}
            {enRoute && <Text style={styles.status}>En route vers Rabat</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1 },
    map: { flex:1 },
    status: { position:'absolute', bottom:40, alignSelf:'center', backgroundColor:'#fff', padding:10, borderRadius:10 }
});
