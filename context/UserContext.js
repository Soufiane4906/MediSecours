
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const UserContext = createContext();

// Custom hook for consuming the context
export function useUser() {
    return useContext(UserContext);
}

// Static users for authentication
const staticUsers = [
    { username: 'user1', password: 'password1', phone: '1234567890' },
    { username: 'user2', password: 'password2', phone: '0987654321' }
];

// Provider component
export function UserProvider({ children }) {
    // User state: user object and authentication status
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [registeredUsers, setRegisteredUsers] = useState(staticUsers);

    // Load registered users from storage on mount
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const storedUsers = await AsyncStorage.getItem('registeredUsers');
                if (storedUsers) {
                    // Merge static users with stored users, avoiding duplicates
                    const parsedUsers = JSON.parse(storedUsers);
                    const mergedUsers = [...staticUsers];

                    parsedUsers.forEach(storedUser => {
                        if (!mergedUsers.some(u => u.username === storedUser.username)) {
                            mergedUsers.push(storedUser);
                        }
                    });

                    setRegisteredUsers(mergedUsers);
                }
            } catch (error) {
                console.error('Error loading registered users:', error);
            }
        };

        loadUsers();
    }, []);

    // Log in a user with validation
    function login(username, password) {
        const foundUser = registeredUsers.find(
            u => u.username === username && u.password === password
        );

        if (foundUser) {
            const userData = { ...foundUser };
            delete userData.password; // Don't store password in state

            setUser(userData);
            setIsAuthenticated(true);
            return true;
        }

        return false;
    }

    // Register a new user
    async function register(userData) {
        // Check if username already exists
        if (registeredUsers.some(u => u.username === userData.username)) {
            return { success: false, message: 'Ce nom d\'utilisateur existe déjà' };
        }

        // Add new user
        const newUsers = [...registeredUsers, userData];
        setRegisteredUsers(newUsers);

        // Save to storage
        try {
            await AsyncStorage.setItem('registeredUsers', JSON.stringify(newUsers));
        } catch (error) {
            console.error('Error saving registered users:', error);
        }

        return { success: true };
    }

    // Log out the user
    function logout() {
        setUser(null);
        setIsAuthenticated(false);
    }

    // Update user profile
    function updateUser(updates) {
        setUser((prev) => ({ ...prev, ...updates }));
    }

    // Value provided to consumers
    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateUser,
        registeredUsers
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}
