// contexts/AppointmentContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const storedAppointments = await AsyncStorage.getItem('appointments');
            if (storedAppointments) {
                setAppointments(JSON.parse(storedAppointments));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveAppointment = async (appointment) => {
        try {
            const newAppointment = {
                id: Date.now().toString(),
                ...appointment
            };
            const updatedAppointments = [...appointments, newAppointment];
            await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
            setAppointments(updatedAppointments);
            return newAppointment;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du rendez-vous:', error);
            throw error;
        }
    };

    const deleteAppointment = async (id) => {
        try {
            const updatedAppointments = appointments.filter(apt => apt.id !== id);
            await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
            setAppointments(updatedAppointments);
        } catch (error) {
            console.error('Erreur lors de la suppression du rendez-vous:', error);
            throw error;
        }
    };

    return (
        <AppointmentContext.Provider value={{
            appointments,
            loading,
            saveAppointment,
            deleteAppointment
        }}>
            {children}
        </AppointmentContext.Provider>
    );
};

export const useAppointments = () => useContext(AppointmentContext);
