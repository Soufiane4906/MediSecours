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
            Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
            return;
        }

        setIsLoading(true);

        // Use the login function from UserContext
        const success = login(username, password);

        setIsLoading(false);

        if (success) {
            navigation.replace('Home');
        } else {
            Alert.alert('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <TextInput
                style={styles.input}
                placeholder="اسم المستخدم"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="كلمة المرور"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button 
                title={isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                onPress={handleLogin}
                disabled={isLoading}
            />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>إنشاء حساب</Text>
            </TouchableOpacity>

            {/* Display static user credentials for testing */}
            {/*   <View style={styles.testCredentials}>
                <Text style={styles.testTitle}>حسابات تجريبية:</Text>
                <Text>المستخدم: user1, كلمة المرور: password1</Text>
                <Text>المستخدم: user2, كلمة المرور: password2</Text>
            </View>
            */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
    title: { fontSize:24, marginBottom:20, fontWeight:'bold' },
    input: { width:'100%', borderWidth:1, borderColor:'#ccc', borderRadius:5, padding:10, marginBottom:10, textAlign:'right' },
    link: { color:'blue', marginTop:10 },
    testCredentials: { marginTop: 30, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, backgroundColor: '#f9f9f9' },
    testTitle: { fontWeight: 'bold', marginBottom: 5 }
});
