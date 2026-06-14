import React, { createContext, useState, useEffect } from 'react';
import { THEMES } from '../utils/themes';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark-blue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemeFromDatabase();
  }, []);

  const fetchThemeFromDatabase = async () => {
    try {
      const response = await fetch('/api/settings/theme');
      const data = await response.json();
      const theme = data.data?.theme || 'dark-blue';
      if (THEMES[theme]) {
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error('Failed to load theme from database:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = async (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(themeKey);
      try {
        await fetch('/api/settings/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: themeKey })
        });
      } catch (error) {
        console.error('Failed to save theme to database:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}
