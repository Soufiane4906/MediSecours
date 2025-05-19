import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

export default function HomeScreen({ navigation }) {
    const { user, isAuthenticated } = useUser();

    // Check if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert(
                'غير مسجل',
                'يرجى تسجيل الدخول للوصول إلى التطبيق',
                [{ text: 'حسنًا', onPress: () => navigation.replace('Login') }]
            );
        }
    }, [isAuthenticated, navigation]);

    // Get display name from user context
    const displayName = user?.displayName || user?.username || 'مستخدم';

    if (!isAuthenticated) {
        return null; // Don't render anything while redirecting
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>مرحبًا {displayName}</Text>
            <Text style={styles.subtitle}>ماذا تريد أن تفعل اليوم؟</Text>

            <View style={styles.iconsContainer}>
                <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('Map')}
                >
                    <Image source={require('../assets/ambulance.png')} style={styles.icon} />
                    <Text style={styles.iconText}>سيارة إسعاف</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('التقويم')}
                >
                    <Image source={require('../assets/hospital.png')} style={styles.icon} />
                    <Text style={styles.iconText}>مستشفى</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('الملف الشخصي')}
            >
                <Text style={styles.profileButtonText}>ملف طبي شخصي</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8'
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#e74c3c'
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center'
    },
    iconsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%',
        marginBottom: 40
    },
    iconButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        width: '45%'
    },
    icon: { 
        width: 80, 
        height: 80, 
        marginBottom: 15 
    },
    iconText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333'
    },
    profileButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    profileButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
