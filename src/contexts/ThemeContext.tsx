
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useProfile();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [style, setStyle] = useState<ThemeStyle>('default');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Update theme based on system preference or user selection
  useEffect(() => {
    const updateActualTheme = () => {
      if (mode === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setActualTheme(systemTheme);
      } else {
        setActualTheme(mode);
      }
    };

    updateActualTheme();

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateActualTheme);
      return () => mediaQuery.removeEventListener('change', updateActualTheme);
    }
  }, [mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);

    // Apply compact theme styles
    if (style === 'compact') {
      root.classList.add('compact-theme');
    } else {
      root.classList.remove('compact-theme');
    }
  }, [actualTheme, style]);

  // Load theme from profile
  useEffect(() => {
    if (!loading && profile) {
      if (profile.theme_mode) {
        setMode(profile.theme_mode as ThemeMode);
      }
      if (profile.theme_style) {
        setStyle(profile.theme_style as ThemeStyle);
      }
    }
  }, [profile, loading]);

  const updateMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    if (profile) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_mode: newMode })
          .eq('id', profile.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating theme mode:', error);
        toast.error('Failed to save theme preference');
      }
    }
  };

  const updateStyle = async (newStyle: ThemeStyle) => {
    setStyle(newStyle);
    if (profile) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_style: newStyle })
          .eq('id', profile.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating theme style:', error);
        toast.error('Failed to save theme style');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{
      mode,
      style,
      setMode: updateMode,
      setStyle: updateStyle,
      actualTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
