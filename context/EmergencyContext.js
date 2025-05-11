
import React, { createContext, useContext, useState } from "react";

// Create the context
export const EmergencyContext = createContext();

// Custom hook for consuming the context
export function useEmergency() {
    return useContext(EmergencyContext);
}

// Provider component
export function EmergencyProvider({ children }) {
    // Example state: list of emergencies and current status
    const [emergencies, setEmergencies] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | active | resolved

    // Add a new emergency
    function addEmergency(emergency) {
        setEmergencies((prev) => [...prev, emergency]);
        setStatus("active");
    }

    // Resolve all emergencies
    function resolveEmergencies() {
        setEmergencies([]);
        setStatus("resolved");
    }

    // Value provided to consumers
    const value = {
        emergencies,
        status,
        addEmergency,
        resolveEmergencies,
    };

    return (
        <EmergencyContext.Provider value={value}>
            {children}
        </EmergencyContext.Provider>
    );
}
