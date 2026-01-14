'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light mode' },
  { value: 'dark', icon: Moon, label: 'Dark mode' },
  { value: 'system', icon: Monitor, label: 'System preference' },
] as const;

export function ThemeToggle(): React.ReactElement {
  const { theme, setTheme } = useTheme();

  const currentIndex = THEME_OPTIONS.findIndex((option) => option.value === theme);
  const currentOption = THEME_OPTIONS[currentIndex] ?? THEME_OPTIONS[2];
  const Icon = currentOption.icon;

  function handleCycleTheme(): void {
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].value);
  }

  return (
    <button
      onClick={handleCycleTheme}
      className="p-2 rounded-md bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`Current theme: ${currentOption.label}. Click to cycle themes.`}
      title={`Switch from ${currentOption.label}`}
    >
      <Icon size={20} />
    </button>
  );
}
