'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'auto';

const themes = [
  { value: 'light' as Theme, label: 'Light', icon: Sun },
  { value: 'dark' as Theme, label: 'Dark', icon: Moon },
  { value: 'auto' as Theme, label: 'System', icon: Monitor },
];

function getTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('starlight-theme');
    if (stored === 'light' || stored === 'dark' || stored === '') {
      // Starlight stores empty string for 'auto'
      return stored === '' ? 'auto' : stored;
    }
  }
  return 'dark';
}

function setTheme(theme: Theme) {
  if (typeof localStorage !== 'undefined') {
    // Starlight expects empty string for 'auto', not the literal 'auto' string
    localStorage.setItem(
      'starlight-theme',
      theme === 'light' || theme === 'dark' ? theme : '',
    );
  }

  const root = document.documentElement;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    root.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    root.dataset.theme = theme;
  }

  // Dispatch event for Starlight's theme provider
  document.dispatchEvent(
    new CustomEvent('theme-changed', { detail: { theme } }),
  );
}

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemeState(getTheme());

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getTheme() === 'auto') {
        setTheme('auto');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-[var(--sl-color-gray-2)]"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[var(--sl-color-gray-2)] hover:text-[var(--sl-color-text)] hover:bg-[var(--sl-color-bg-nav)]"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleThemeChange(value)}
            className={cn(
              'gap-2 cursor-pointer',
              theme === value && 'bg-accent',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
