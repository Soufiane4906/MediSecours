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
            Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            Alert.alert('خطأ', 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل');
            return;
        }

        setIsLoading(true);

        // Register the user
        const userData = { username, password, phone };
        const result = await register(userData);

        if (result.success) {
            // Auto-login after successful registration
            login(username, password);
            Alert.alert('نجاح', 'تم التسجيل بنجاح!', [
                { text: 'حسنًا', onPress: () => navigation.replace('Home') }
            ]);
        } else {
            Alert.alert('خطأ', result.message || 'حدث خطأ أثناء التسجيل');
        }

        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>إنشاء حساب</Text>
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
            <TextInput
                style={styles.input}
                placeholder="تأكيد كلمة المرور"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="رقم الهاتف"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color="#e74c3c" />
            ) : (
                <Button title="تسجيل" onPress={handleSignUp} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
    title: { fontSize:24, marginBottom:20, fontWeight:'bold' },
    input: { width:'100%', borderWidth:1, borderColor:'#ccc', borderRadius:5, padding:10, marginBottom:10, textAlign:'right' }
});
