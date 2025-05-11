import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { EmergencyProvider } from './context/EmergencyContext';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import CalendarScreen from './screens/CalendarScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import AmbulanceTypeScreen from './screens/AmbulanceTypeScreen';
import HospitalDetailsScreen from './screens/HospitalDetailsScreen';
import AppointmentDetailScreen from './screens/AppointmentDetailScreen';
import {MaterialCommunityIcons} from "@expo/vector-icons";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
    return (
        <Drawer.Navigator
            initialRouteName="Accueil"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#e74c3c',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: '#e74c3c',
                drawerLabelStyle: {
                    fontSize: 16,
                }
            }}
        >
            <Drawer.Screen
                name="Accueil"
                component={HomeScreen}
                options={{
                    title: 'Accueil',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="home" size={24} color={color} />
                }}
            />
            <Drawer.Screen
                name="Carte"
                component={MapScreen}
                options={{
                    title: 'Carte des urgences',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="map-marker" size={24} color={color} />
                }}
            />
            <Drawer.Screen
                name="Calendrier"
                component={CalendarScreen}
                options={{
                    title: 'Rendez-vous',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="calendar" size={24} color={color} />
                }}
            />
            <Drawer.Screen
                name="Contacts"
                component={EmergencyContactsScreen}
                options={{
                    title: 'Contacts d\'urgence',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="phone" size={24} color={color} />
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Mon profil',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="account" size={24} color={color} />
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Paramètres',
                    drawerIcon: ({color}) => <MaterialCommunityIcons name="cog" size={24} color={color} />
                }}
            />
        </Drawer.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <UserProvider>
                    <EmergencyProvider>
                        <NavigationContainer
                            linking={{
                                enabled: true,
                                prefixes: ['monapp://'],
                                config: {
                                    screens: {
                                        Login: 'login',
                                        SignUp: 'signup',
                                        Home: {
                                            screens: {
                                                Accueil: 'home',
                                                Carte: 'map',
                                                Calendrier: 'calendar',
                                                Contacts: 'contacts',
                                                Profile: 'profile',
                                                Settings: 'settings',
                                            }
                                        },
                                        AmbulanceType: 'ambulance-type',
                                        HospitalDetails: 'hospital-details',
                                        AppointmentDetail: 'appointment-detail',
                                        Map: 'map-screen',
                                    }
                                }
                            }}
                        >
                            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="SignUp" component={SignUpScreen} />
                                <Stack.Screen name="Home" component={MainDrawer} />
                                <Stack.Screen name="AmbulanceType" component={AmbulanceTypeScreen} />
                                <Stack.Screen name="HospitalDetails" component={HospitalDetailsScreen} />
                                <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
                                <Stack.Screen name="Map" component={MapScreen} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </EmergencyProvider>
                </UserProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

