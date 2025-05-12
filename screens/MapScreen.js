import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import MapView, { Marker, Polyline, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useUser } from '../context/UserContext';

// Waypoints pour une route plus réaliste
const getRouteWaypoints = (start, end) => {
    // Générer des points intermédiaires aléatoires entre départ et arrivée
    const routePoints = [start];

    const steps = 8; // Nombre de points intermédiaires
    for (let i = 1; i <= steps; i++) {
        const randomOffset = {
            latOffset: (Math.random() * 0.02 - 0.01) * (i/steps),
            lngOffset: (Math.random() * 0.02 - 0.01) * (i/steps)
        };

        routePoints.push({
            latitude: start.latitude + (end.latitude - start.latitude) * (i / (steps + 1)) + randomOffset.latOffset,
            longitude: start.longitude + (end.longitude - start.longitude) * (i / (steps + 1)) + randomOffset.lngOffset
        });
    }

    routePoints.push(end);
    return routePoints;
};

// Données d'ambulances enrichies
const ambulanceProviders = [
    {
        id: 1,
        name: 'Ambulance Casablanca',
        latitude: 33.5731,
        longitude: -7.5898,
        rating: 4.8,
        responseTime: '5-7 min',
        type: 'emergency',
        contact: '+212 522 123456',
        available: true
    },
    {
        id: 2,
        name: 'Ambulance Rabat',
        latitude: 34.0209,
        longitude: -6.8416,
        rating: 4.5,
        responseTime: '8-10 min',
        type: 'emergency',
        contact: '+212 537 654321',
        available: true
    },
    {
        id: 3,
        name: 'Médic Express',
        latitude: 33.6100,
        longitude: -7.6300,
        rating: 4.9,
        responseTime: '4-6 min',
        type: 'premium',
        contact: '+212 522 987654',
        available: true
    },
    {
        id: 4,
        name: 'Ambulance Marrakech',
        latitude: 31.6295,
        longitude: -7.9811,
        rating: 4.7,
        responseTime: '7-9 min',
        type: 'standard',
        contact: '+212 524 123456',
        available: false
    }
];

// Points d'intérêt médicaux
const medicalPOIs = [
    {
        id: 1,
        name: 'Hôpital Cheikh Khalifa',
        latitude: 33.5890,
        longitude: -7.6300,
        type: 'hospital',
        rating: 4.3,
        services: ['Urgences', 'Cardiologie', 'Radiologie'],
        contact: '+212 522 889900'
    },
    {
        id: 2,
        name: 'Clinique Ain Borja',
        latitude: 33.5680,
        longitude: -7.6100,
        type: 'clinic',
        rating: 4.5,
        services: ['Obstétrique', 'Pédiatrie'],
        contact: '+212 522 223344'
    },
    {
        id: 3,
        name: 'Pharmacie Centrale',
        latitude: 33.5730,
        longitude: -7.5950,
        type: 'pharmacy',
        rating: 4.2,
        services: ['24/7', 'Livraison'],
        contact: '+212 522 112233'
    }
];

export default function MapScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState(ambulanceProviders);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedPOI, setSelectedPOI] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [poiModalVisible, setPoiModalVisible] = useState(false);
    const [routeAnimation, setRouteAnimation] = useState(0);
    const [distance, setDistance] = useState(null);
    const [eta, setEta] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [routeWaypoints, setRouteWaypoints] = useState([]);
    const [mapType, setMapType] = useState('standard');
    const [filterOptions, setFilterOptions] = useState({
        emergency: true,
        standard: true,
        premium: true,
        hospital: true,
        pharmacy: true,
        clinic: true
    });
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);

    const mapRef = useRef(null);
    const bottomSheetAnim = useRef(new Animated.Value(0)).current;
    const emergencySlideAnim = useRef(new Animated.Value(-100)).current;
    const callAnim = useRef(new Animated.Value(1)).current;
    const insets = useSafeAreaInsets();
    const user = useUser();

    // Obtenir la position actuelle
    useEffect(() => {
        (async () => {
            try {
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'L\'accès à la localisation est nécessaire pour afficher votre position.');
                    setLoading(false);
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                const initialRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };

                setUserLocation(initialRegion);
                setProviders(ambulanceProviders);
                setLoading(false);

                if (mapRef.current) {
                    mapRef.current.animateToRegion(initialRegion);
                }
            } catch (error) {
                console.error("Erreur de localisation:", error);
                setLoading(false);
                Alert.alert("Erreur", "Impossible d'obtenir votre position actuelle.");
            }
        })();
    }, []);

    // Gérer la sélection d'un fournisseur
    const handleProviderSelect = (provider) => {
        setSelectedProvider(provider);
        setModalVisible(true);
    };

    // Gérer la sélection d'un POI
    const handlePOISelect = (poi) => {
        setSelectedPOI(poi);
        setPoiModalVisible(true);
    };

    // Calculer la route vers un fournisseur
    const handleRouteCalculation = (destination) => {
        if (!userLocation) return;

        const start = {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
        };

        const end = {
            latitude: destination.latitude,
            longitude: destination.longitude
        };

        // Calculer la distance approximative
        const distanceInKm = calculateDistance(
            start.latitude,
            start.longitude,
            end.latitude,
            end.longitude
        );

        setDistance(distanceInKm.toFixed(1));

        // Estimer le temps d'arrivée (10 min par km, approximatif)
        const estimatedTime = Math.ceil(distanceInKm * 3);
        setEta(estimatedTime);

        // Générer des points pour la route
        const waypoints = getRouteWaypoints(start, end);
        setRouteWaypoints(waypoints);
        setShowRoute(true);
        setModalVisible(false);

        // Animer la feuille de bas
        Animated.timing(bottomSheetAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // Calculer la distance entre deux points (formule de Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance en km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Appeler un fournisseur
    const callProvider = () => {
        if (selectedProvider) {
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }

            Alert.alert(
                "Appel",
                `Appeler ${selectedProvider.name} au ${selectedProvider.contact}?`,
                [
                    {text: "Annuler", style: "cancel"},
                    {text: "Appeler", onPress: () => console.log("Appel en cours...")}
                ]
            );
        }
    };

    // Changer le type de carte
    const toggleMapType = () => {
        setMapType(mapType === 'standard' ? 'satellite' : 'standard');
    };

    // Filtrer les fournisseurs en fonction des options
    const filteredProviders = providers.filter(p =>
        filterOptions[p.type]
    );

    // Rendre les marqueurs de fournisseurs
    const renderProvidersMarkers = () => {
        return filteredProviders.map(provider => (
            <Marker
                key={`provider-${provider.id}`}
                coordinate={{
                    latitude: provider.latitude,
                    longitude: provider.longitude
                }}
                onPress={() => handleProviderSelect(provider)}
            >
                <View style={styles.markerContainer}>
                    <MaterialCommunityIcons
                        name={provider.type === 'emergency' ? 'ambulance' : 'car-emergency'}
                        size={30}
                        color={provider.type === 'premium' ? '#e67e22' : '#e74c3c'}
                    />
                    {!provider.available && (
                        <View style={styles.providerBadge}>
                            <MaterialCommunityIcons name="close-circle" size={14} color="#7f8c8d"/>
                        </View>
                    )}
                </View>
                <Callout tooltip>
                    <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>{provider.name}</Text>
                        <Text style={styles.calloutDetail}>Note: {provider.rating} ⭐</Text>
                        <Text style={styles.calloutDetail}>Temps: {provider.responseTime}</Text>
                    </View>
                </Callout>
            </Marker>
        ));
    };

    // L'écran de chargement
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e74c3c"/>
                <Text style={styles.loadingText}>Chargement de la carte...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                mapType={mapType}
                initialRegion={userLocation}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={true}
                rotateEnabled={true}
                zoomEnabled={true}
            >
                {renderProvidersMarkers()}
                {/* Polyline pour la route */}
                {showRoute && routeWaypoints.length > 1 && (
                    <Polyline
                        coordinates={routeWaypoints}
                        strokeWidth={5}
                        strokeColor="#3498db"
                        lineDashPattern={[0]}
                    />
                )}
            </MapView>

            {/* Contrôles de la carte */}
            <View style={[styles.mapControls, {top: insets.top + 20}]}>
                <TouchableOpacity style={styles.mapButton} onPress={toggleMapType}>
                    <MaterialCommunityIcons
                        name={mapType === 'standard' ? 'satellite-variant' : 'map'}
                        size={24}
                        color="#333"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* Bouton d'urgence */}
            <View style={[styles.emergencyButtonContainer, {bottom: insets.bottom + 100}]}>
                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => navigation.navigate('AmbulanceType')}
                >
                    <LinearGradient
                        colors={['#e74c3c', '#c0392b']}
                        style={styles.emergencyGradient}
                    >
                        <MaterialCommunityIcons name="ambulance" size={32} color="white"/>
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.emergencyText}>URGENCE</Text>
            </View>

            {/* Modal du fournisseur */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedProvider && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{selectedProvider.name}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="#333"/>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.modalBody}>
                                    <View style={styles.modalInfoRow}>
                                        <MaterialCommunityIcons name="star" size={24} color="#f39c12"/>
                                        <Text style={styles.modalInfoText}>Note: {selectedProvider.rating}/5</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <MaterialCommunityIcons name="clock" size={24} color="#3498db"/>
                                        <Text style={styles.modalInfoText}>Temps de
                                            réponse: {selectedProvider.responseTime}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <MaterialCommunityIcons name="phone" size={24} color="#2ecc71"/>
                                        <Text style={styles.modalInfoText}>{selectedProvider.contact}</Text>
                                    </View>

                                    <Text style={styles.modalSectionTitle}>Services</Text>
                                    <View style={styles.servicesTags}>
                                        <View style={styles.serviceTag}>
                                            <Text style={styles.serviceTagText}>Transport médical</Text>
                                        </View>
                                        <View style={styles.serviceTag}>
                                            <Text style={styles.serviceTagText}>Premier secours</Text>
                                        </View>
                                        <View style={styles.serviceTag}>
                                            <Text style={styles.serviceTagText}>Équipement médical</Text>
                                        </View>
                                        {selectedProvider.type === 'premium' && (
                                            <View style={styles.serviceTag}>
                                                <Text style={styles.serviceTagText}>Médecin à bord</Text>
                                            </View>
                                        )}
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.modalCallButton}
                                    onPress={callProvider}
                                >
                                    <MaterialCommunityIcons name="phone" size={24} color="white"/>
                                    <Text style={styles.modalButtonText}>Appeler</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalRouteButton}
                                    onPress={() => handleRouteCalculation(selectedProvider)}
                                >
                                    <MaterialCommunityIcons name="map-marker-path" size={24} color="white"/>
                                    <Text style={styles.modalButtonText}>Itinéraire</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Panneau inférieur pour l'itinéraire */}
            {showRoute && (
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        {
                            transform: [{
                                translateY: bottomSheetAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [200, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={styles.bottomSheetHandle}/>

                    <View style={styles.routeInfo}>
                        <View style={styles.routeInfoItem}>
                            <MaterialCommunityIcons name="map-marker-distance" size={24} color="#3498db"/>
                            <Text style={styles.routeInfoText}>{distance} km</Text>
                        </View>

                        <View style={styles.routeInfoItem}>
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#e67e22"/>
                            <Text style={styles.routeInfoText}>{eta} min</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={callProvider}
                        >
                            <MaterialCommunityIcons name="phone" size={20} color="white"/>
                            <Text style={styles.callButtonText}>Appeler</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 122, 255, 0.2)',
        borderWidth: 2,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userMarkerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    calloutContainer: {
        width: 160,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    calloutDetail: {
        fontSize: 12,
        color: '#666',
    },
    status: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    providerBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
    },
    emergencyButtonContainer: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
    },
    emergencyButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    emergencyGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emergencyText: {
        marginTop: 5,
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    mapControls: {
        position: 'absolute',
        left: 20,
        flexDirection: 'column',
        gap: 10,
    },
    mapButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    bottomSheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 10,
    },
    routeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    routeInfoItem: {
        alignItems: 'center',
    },
    routeInfoText: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    callButton: {
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    callButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    emergencyStrip: {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundColor: '#e74c3c',
        padding: 15,
    },
    emergencyStripContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyInfo: {
        flex: 1,
        marginLeft: 10,
    },
    emergencyTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emergencySubtitle: {
        color: 'white',
        opacity: 0.9,
    },
    emergencyCancel: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        marginBottom: 20,
    },
    modalInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalInfoText: {
        marginLeft: 10,
        fontSize: 16,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
    },
    servicesTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    serviceTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    serviceTagText: {
        fontSize: 14,
        color: '#333',
    },
    modalCallButton: {
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    modalRouteButton: {
        flexDirection: 'row',
        backgroundColor: '#3498db',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalPhoneButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 5,
    },
    modalCalendarButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#9b59b6',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 5,
    },
    filterModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterModalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '85%',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    filterOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterOptionActive: {
        backgroundColor: '#e74c3c',
        borderColor: '#e74c3c',
    },
    filterOptionText: {
        marginLeft: 5,
    },
    filterOptionTextActive: {
        color: 'white',
    },
    applyFilterButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    applyFilterText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

