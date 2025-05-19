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
            Alert.alert('غير مسجل', 'يرجى تسجيل الدخول للوصول إلى ملفك الشخصي', [
                { text: 'حسنًا', onPress: () => navigation.navigate('Login') }
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
            console.error('خطأ في تحميل الملف الشخصي:', error);
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
            Alert.alert('نجاح', 'تم حفظ الملف الشخصي بنجاح');
        } catch (error) {
            console.error('خطأ في حفظ الملف الشخصي:', error);
            Alert.alert('خطأ', 'تعذر حفظ الملف الشخصي');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل أنت متأكد أنك تريد تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تسجيل الخروج',
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
                <Text>يرجى تسجيل الدخول للوصول إلى ملفك الشخصي</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ملفي الطبي</Text>
                <TouchableOpacity onPress={() => isEditing ? saveProfile() : setIsEditing(true)}>
                    <MaterialCommunityIcons
                        name={isEditing ? "content-save" : "pencil"}
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.username}>المستخدم: {user.username}</Text>
                {user.phone && <Text style={styles.phone}>الهاتف: {user.phone}</Text>}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>الاسم الكامل</Text>
                <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => setProfile({...profile, name: text})}
                    editable={isEditing}
                    placeholder="أدخل اسمك الكامل"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>تاريخ الميلاد</Text>
                <TextInput
                    style={styles.input}
                    value={profile.birthDate}
                    onChangeText={(text) => setProfile({...profile, birthDate: text})}
                    editable={isEditing}
                    placeholder="يوم/شهر/سنة"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>فصيلة الدم</Text>
                <TextInput
                    style={styles.input}
                    value={profile.bloodType}
                    onChangeText={(text) => setProfile({...profile, bloodType: text})}
                    editable={isEditing}
                    placeholder="مثال: A+، O-، إلخ"
                />
            </View>

            <View style={styles.formRow}>
                <View style={[styles.formGroup, {flex: 1, marginRight: 5}]}>
                    <Text style={styles.label}>الطول (سم)</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.height}
                        onChangeText={(text) => setProfile({...profile, height: text})}
                        editable={isEditing}
                        keyboardType="numeric"
                        placeholder="مثال: 175"
                    />
                </View>
                <View style={[styles.formGroup, {flex: 1, marginLeft: 5}]}>
                    <Text style={styles.label}>الوزن (كجم)</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.weight}
                        onChangeText={(text) => setProfile({...profile, weight: text})}
                        editable={isEditing}
                        keyboardType="numeric"
                        placeholder="مثال: 70"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>الحساسية</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.allergies}
                    onChangeText={(text) => setProfile({...profile, allergies: text})}
                    editable={isEditing}
                    multiline
                    placeholder="اذكر أي حساسية لديك"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>الأمراض المزمنة</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.chronicDiseases}
                    onChangeText={(text) => setProfile({...profile, chronicDiseases: text})}
                    editable={isEditing}
                    multiline
                    placeholder="اذكر أي أمراض مزمنة"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>الأدوية</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.medications}
                    onChangeText={(text) => setProfile({...profile, medications: text})}
                    editable={isEditing}
                    multiline
                    placeholder="اذكر الأدوية الحالية"
                />
            </View>

            <View style={styles.logoutContainer}>
                <Button
                    title="تسجيل الخروج"
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
        textAlign: 'right',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        textAlign: 'right',
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
