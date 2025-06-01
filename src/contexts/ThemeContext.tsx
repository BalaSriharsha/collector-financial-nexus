
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeStyle = 'default' | 'compact';

interface ThemeContextType {
  mode: ThemeMode;
  style: ThemeStyle;
  setMode: (mode: ThemeMode) => void;
  setStyle: (style: ThemeStyle) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [style, setStyleState] = useState<ThemeStyle>('default');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_mode, theme_style')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setModeState((data.theme_mode as ThemeMode) || 'system');
          setStyleState((data.theme_style as ThemeStyle) || 'default');
        }
      } catch (error) {
        console.error('Error fetching theme preferences:', error);
      }
    };

    fetchUserTheme();
  }, [user]);

  useEffect(() => {
    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const updateActualTheme = () => {
      const theme = mode === 'system' ? getSystemTheme() : mode;
      setActualTheme(theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply compact theme
      if (style === 'compact') {
        document.documentElement.classList.add('compact-theme');
      } else {
        document.documentElement.classList.remove('compact-theme');
      }
    };

    updateActualTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        updateActualTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, style]);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_mode: newMode })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating theme mode:', error);
      }
    }
  };

  const setStyle = async (newStyle: ThemeStyle) => {
    setStyleState(newStyle);
    
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_style: newStyle })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating theme style:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, style, setMode, setStyle, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
