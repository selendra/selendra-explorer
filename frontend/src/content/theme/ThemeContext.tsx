import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import { getStorageItem, setStorageItem, getSystemTheme } from '../../utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDarkModeEnabled: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme based on app config and user preferences
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if dark mode is enabled in app config
    if (!APP_CONFIG.features.darkMode) {
      return 'light';
    }
    
    // Get saved theme from localStorage
    const savedTheme = getStorageItem<Theme>('theme');
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Use app config default theme
    if (APP_CONFIG.settings.theme) {
      return APP_CONFIG.settings.theme;
    }
    
    // Fallback to system preference
    return getSystemTheme();
  });
  
  // Set theme function
  const setTheme = (newTheme: Theme) => {
    // Only allow setting theme if dark mode is enabled in config
    if (!APP_CONFIG.features.darkMode && newTheme === 'dark') {
      console.warn('Dark mode is disabled in app configuration');
      return;
    }
    
    setThemeState(newTheme);
    setStorageItem('theme', newTheme);
  };
  
  // Toggle theme function
  const toggleTheme = () => {
    // Only allow toggling if dark mode is enabled in config
    if (!APP_CONFIG.features.darkMode) {
      console.warn('Dark mode is disabled in app configuration');
      return;
    }
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Set CSS custom properties based on theme
    if (theme === 'dark') {
      root.style.setProperty('--background-color', '#1f2937');
      root.style.setProperty('--text-color', '#f9fafb');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--secondary-color', '#9ca3af');
    } else {
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--text-color', '#1f2937');
      root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--secondary-color', '#6b7280');
    }
  }, [theme]);
  
  // Listen for system preference changes (only if dark mode is enabled and no saved preference)
  useEffect(() => {
    if (!APP_CONFIG.features.darkMode) {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = getStorageItem<Theme>('theme');
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Initialize theme on mount based on config
  useEffect(() => {
    // If dark mode is disabled, force light theme
    if (!APP_CONFIG.features.darkMode && theme === 'dark') {
      setThemeState('light');
      setStorageItem('theme', 'light');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        setTheme,
        isDarkModeEnabled: APP_CONFIG.features.darkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};