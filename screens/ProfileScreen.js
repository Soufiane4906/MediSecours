// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, updateUser, logout, isAuthenticated } = useUser();

    const [profile, setProfile] = useState({
        name: '',
        birthDate: '',
        bloodType: '',
        height: '',
        weight: '',
        allergies: '',
        chronicDiseases: '',
        medications: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert('Non connecté', 'Veuillez vous connecter pour accéder à votre profil', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        loadProfile();
    }, [isAuthenticated]);

    const loadProfile = async () => {
        try {
            // Try to load profile specific to this user
            const profileKey = `userProfile_${user.username}`;
            const storedProfile = await AsyncStorage.getItem(profileKey);

            if (storedProfile) {
                setProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
    };

    const saveProfile = async () => {
        try {
            // Save profile specific to this user
            const profileKey = `userProfile_${user.username}`;
            await AsyncStorage.setItem(profileKey, JSON.stringify(profile));

            // Update user context with name if available
            if (profile.name) {
                updateUser({ displayName: profile.name });
            }

            setIsEditing(false);
            Alert.alert('Succès', 'Profil enregistré avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du profil:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer le profil');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Déconnexion', 
                    onPress: () => {
                        logout();
                        navigation.navigate('Login');
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <Text>Veuillez vous connecter pour accéder à votre profil</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon profil médical</Text>
                <TouchableOpacity onPress={() => isEditing ? saveProfile() : setIsEditing(true)}>
                    <MaterialCommunityIcons
                        name={isEditing ? "content-save" : "pencil"}
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.username}>Utilisateur: {user.username}</Text>
                {user.phone && <Text style={styles.phone}>Téléphone: {user.phone}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => setProfile({...profile, name: text})}
                    editable={isEditing}
                    placeholder="Entrez votre nom complet"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Date de naissance</Text>
                <TextInput
                    style={styles.input}
                    value={profile.birthDate}
                    onChangeText={(text) => setProfile({...profile, birthDate: text})}
                    editable={isEditing}
                    placeholder="JJ/MM/AAAA"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Groupe sanguin</Text>
                <TextInput
                    style={styles.input}
                    value={profile.bloodType}
                    onChangeText={(text) => setProfile({...profile, bloodType: text})}
                    editable={isEditing}
                    placeholder="Ex: A+, O-, etc."
                />
            </View>

            <View style={styles.formRow}>
                <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}>
                    <Text style={styles.label}>Taille (cm)</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.height}
                        onChangeText={(text) => setProfile({...profile, height: text})}
                        editable={isEditing}
                        keyboardType="numeric"
                        placeholder="Ex: 175"
                    />
                </View>
                <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}>
                    <Text style={styles.label}>Poids (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.weight}
                        onChangeText={(text) => setProfile({...profile, weight: text})}
                        editable={isEditing}
                        keyboardType="numeric"
                        placeholder="Ex: 70"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Allergies</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.allergies}
                    onChangeText={(text) => setProfile({...profile, allergies: text})}
                    editable={isEditing}
                    multiline
                    placeholder="Listez vos allergies"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Maladies chroniques</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.chronicDiseases}
                    onChangeText={(text) => setProfile({...profile, chronicDiseases: text})}
                    editable={isEditing}
                    multiline
                    placeholder="Listez vos maladies chroniques"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Médicaments</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.medications}
                    onChangeText={(text) => setProfile({...profile, medications: text})}
                    editable={isEditing}
                    multiline
                    placeholder="Listez vos médicaments actuels"
                />
            </View>

            <View style={styles.logoutContainer}>
                <Button
                    title="Déconnexion"
                    onPress={handleLogout}
                    color="#e74c3c"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    userInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    phone: {
        fontSize: 16,
        color: '#666',
    },
    formGroup: {
        marginBottom: 15,
    },
    formRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '500',
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    logoutContainer: {
        marginTop: 30,
        marginBottom: 50,
    }
});
