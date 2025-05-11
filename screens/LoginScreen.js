import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useUser();

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);

        // Use the login function from UserContext
        const success = login(username, password);

        setIsLoading(false);

        if (success) {
            navigation.replace('Home');
        } else {
            Alert.alert('Erreur', 'Nom d\'utilisateur ou mot de passe incorrect');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>
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
            <Button 
                title={isLoading ? "Connexion en cours..." : "Se connecter"} 
                onPress={handleLogin}
                disabled={isLoading}
            />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>S’inscrire</Text>
            </TouchableOpacity>

            {/* Display static user credentials for testing */}
            <View style={styles.testCredentials}>
                <Text style={styles.testTitle}>Utilisateurs de test:</Text>
                <Text>Utilisateur: user1, Mot de passe: password1</Text>
                <Text>Utilisateur: user2, Mot de passe: password2</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
    title: { fontSize:24, marginBottom:20 },
    input: { width:'100%', borderWidth:1, borderColor:'#ccc', borderRadius:5, padding:10, marginBottom:10 },
    link: { color:'blue', marginTop:10 },
    testCredentials: { marginTop: 30, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, backgroundColor: '#f9f9f9' },
    testTitle: { fontWeight: 'bold', marginBottom: 5 }
});
