import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Check localStorage for user preference
    if (localStorage.theme === 'dark') return true;
    if (localStorage.theme === 'light') return false;
    
    // Fallback to system preference if no user preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply the dark mode class to the root element
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    }
    
    // Listen for system preference changes (only when no explicit user preference)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!('theme' in localStorage)) {
        setDarkMode(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setSystemPreference = () => {
    localStorage.removeItem('theme');
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  return { 
    darkMode, 
    toggleDarkMode,
    setSystemPreference
  };
};

export default useDarkMode;