'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light mode' },
    { value: 'dark', icon: Moon, label: 'Dark mode' },
    { value: 'system', icon: Monitor, label: 'System preference' },
  ] as const;

  const currentOption = themeOptions.find(option => option.value === theme) || themeOptions[2];

  const handleCycleTheme = () => {
    const currentIndex = themeOptions.findIndex(option => option.value === theme);
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex].value);
  };

  return (
    <button
      onClick={handleCycleTheme}
      className="p-2 rounded-md bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`Current theme: ${currentOption.label}. Click to cycle themes.`}
      title={`Switch from ${currentOption.label}`}
    >
      <currentOption.icon size={20} />
    </button>
  );
}