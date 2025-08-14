'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'interval-timer-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    const initialTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';
    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  // Handle theme changes and system preference detection
  useEffect(() => {
    if (!isInitialized) return;

    const updateActualTheme = () => {
      let newActualTheme: 'light' | 'dark';

      if (theme === 'system') {
        try {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          newActualTheme = mediaQuery.matches ? 'dark' : 'light';
        } catch (error) {
          console.error('ThemeProvider: Error detecting system theme:', error);
          newActualTheme = 'light'; // fallback
        }
      } else {
        newActualTheme = theme;
      }

      setActualTheme(newActualTheme);

      // Update the DOM
      const root = document.documentElement;
      if (newActualTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark');
      } else {
        root.removeAttribute('data-theme');
        root.classList.remove('dark');
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => {
          if (theme === 'system') {
            updateActualTheme();
          }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
      } catch (error) {
        console.error('ThemeProvider: Error setting up system theme listener:', error);
      }
    }
  }, [theme, isInitialized]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        actualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}