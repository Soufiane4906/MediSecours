import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';

export default function SignUpScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useUser();

    const handleSignUp = async () => {
        // Validate all fields are filled
        if (!username || !password || !confirmPassword || !phone) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        // Register the user
        const userData = { username, password, phone };
        const result = await register(userData);

        if (result.success) {
            // Auto-login after successful registration
            login(username, password);
            Alert.alert('Succès', 'Inscription réussie!', [
                { text: 'OK', onPress: () => navigation.replace('Home') }
            ]);
        } else {
            Alert.alert('Erreur', result.message || 'Erreur lors de l\'inscription');
        }

        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Inscription</Text>
            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color="#e74c3c" />
            ) : (
                <Button title="Valider" onPress={handleSignUp} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
    title: { fontSize:24, marginBottom:20 },
    input: { width:'100%', borderWidth:1, borderColor:'#ccc', borderRadius:5, padding:10, marginBottom:10 }
});
