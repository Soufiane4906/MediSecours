
import React, { createContext, useContext, useState } from "react";

// Create the context
const ThemeContext = createContext();

// Custom hook for consuming the context
export function useTheme() {
    return useContext(ThemeContext);
}

// Provider component
export function ThemeProvider({ children, initialTheme = "light" }) {
    const [theme, setTheme] = useState(initialTheme);

    // Toggle between light and dark themes
    function toggleTheme() {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }

    // Set a specific theme
    function setCustomTheme(newTheme) {
        setTheme(newTheme);
    }

    const value = {
        theme,
        setTheme: setCustomTheme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
