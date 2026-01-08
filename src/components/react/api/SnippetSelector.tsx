'use client';

import { ChevronDown } from 'lucide-react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'sprites-docs-language-preference';

interface SnippetSelectorProps {
  languages: string[];
  defaultLanguage: string;
}

// Language icons as inline SVGs
const TerminalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const GoIcon = () => (
  <svg viewBox="0 0 207 78" fill="currentColor" className="w-6 h-4">
    <path d="m16.2 24.1c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h35.7c.4 0 .5.3.3.6l-1.7 2.6c-.2.3-.7.6-1 .6z" />
    <path d="m1.1 33.3c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h45.6c.4 0 .6.3.5.6l-.8 2.4c-.1.4-.5.6-.9.6z" />
    <path d="m25.3 42.5c-.4 0-.5-.3-.3-.6l1.4-2.5c.2-.3.6-.6 1-.6h20c.4 0 .6.3.6.7l-.2 2.4c0 .4-.4.7-.7.7z" />
    <path d="m129.1 22.3c-6.3 1.6-10.6 2.8-16.8 4.4-1.5.4-1.6.5-2.9-1-1.5-1.7-2.6-2.8-4.7-3.8-6.3-3.1-12.4-2.2-18.1 1.5-6.8 4.4-10.3 10.9-10.2 19 .1 8 5.6 14.6 13.5 15.7 6.8.9 12.5-1.5 17-6.6.9-1.1 1.7-2.3 2.7-3.7-3.6 0-8.1 0-19.3 0-2.1 0-2.6-1.3-1.9-3 1.3-3.1 3.7-8.3 5.1-10.9.3-.6 1-1.6 2.5-1.6h36.4c-.2 2.7-.2 5.4-.6 8.1-1.1 7.2-3.8 13.8-8.2 19.6-7.2 9.5-16.6 15.4-28.5 17-9.8 1.3-18.9-.6-26.9-6.6-7.4-5.6-11.6-13-12.7-22.2-1.3-10.9 1.9-20.7 8.5-29.3 7.1-9.3 16.5-15.2 28-17.3 9.4-1.7 18.4-.6 26.5 4.9 5.3 3.5 9.1 8.3 11.6 14.1.6.9.2 1.4-1 1.7z" />
    <path d="m162.2 77.6c-9.1-.2-17.4-2.8-24.4-8.8-5.9-5.1-9.6-11.6-10.8-19.3-1.8-11.3 1.3-21.3 8.1-30.2 7.3-9.6 16.1-14.6 28-16.7 10.2-1.8 19.8-.8 28.5 5.1 7.9 5.4 12.8 12.7 14.1 22.3 1.7 13.5-2.2 24.5-11.5 33.9-6.6 6.7-14.7 10.9-24 12.8-2.7.5-5.4.6-8 .9zm23.8-40.4c-.1-1.3-.1-2.3-.3-3.3-1.8-9.9-10.9-15.5-20.4-13.3-9.3 2.1-15.3 8-17.5 17.4-1.8 7.8 2 15.7 9.2 18.9 5.5 2.4 11 2.1 16.3-.6 7.9-4.1 12.2-10.5 12.7-19.1z" />
  </svg>
);

const JavaScriptIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
  </svg>
);

const TypeScriptIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
  </svg>
);

const PythonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
  </svg>
);

const ElixirIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M19.793 16.575c0 3.752-2.927 6.82-6.543 6.82-3.616 0-6.543-3.068-6.543-6.82 0-4.316 3.14-8.678 5.77-12.063.582-.748 1.082-1.394 1.476-1.957.394.563.893 1.209 1.476 1.957 2.63 3.385 5.364 7.747 5.364 12.063zm-6.543-5.39c-.795 0-1.438.643-1.438 1.437s.643 1.438 1.438 1.438 1.437-.644 1.437-1.438-.642-1.438-1.437-1.438zm-3.193 4.226c-.678 0-1.227.55-1.227 1.227s.55 1.227 1.227 1.227 1.227-.55 1.227-1.227-.55-1.227-1.227-1.227z" />
  </svg>
);

const CurlIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
  >
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  </svg>
);

const languageConfig: Record<string, { label: string; icon: ReactNode }> = {
  cli: { label: 'CLI', icon: <TerminalIcon /> },
  bash: { label: 'CLI', icon: <TerminalIcon /> },
  curl: { label: 'cURL', icon: <CurlIcon /> },
  go: { label: 'Go', icon: <GoIcon /> },
  javascript: { label: 'JavaScript', icon: <JavaScriptIcon /> },
  typescript: { label: 'TypeScript', icon: <TypeScriptIcon /> },
  python: { label: 'Python', icon: <PythonIcon /> },
  elixir: { label: 'Elixir', icon: <ElixirIcon /> },
};

function getStoredLanguage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredLanguage(language: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignore storage errors
  }
}

export function SnippetSelector({
  languages,
  defaultLanguage,
}: SnippetSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Determine initial value: stored preference > defaultLanguage
  const getInitialValue = () => {
    const stored = getStoredLanguage();
    if (stored && languages.includes(stored)) {
      return stored;
    }
    return defaultLanguage;
  };

  const [value, setValue] = useState(getInitialValue);

  const updateActiveBlock = useCallback((newValue: string) => {
    // Find the parent code-snippets container and update it directly
    const container = containerRef.current?.closest('.code-snippets');
    if (container) {
      // Hide all code blocks
      container.querySelectorAll('.code-snippet-block').forEach((block) => {
        block.classList.remove('active');
      });
      // Show the selected language block
      const targetBlock = container.querySelector(
        `[data-language="${newValue}"]`,
      );
      if (targetBlock) {
        targetBlock.classList.add('active');
      }
    }
  }, []);

  // On mount, check localStorage and sync if needed
  useEffect(() => {
    const stored = getStoredLanguage();
    if (stored && languages.includes(stored) && stored !== value) {
      setValue(stored);
      updateActiveBlock(stored);
    }
  }, [languages, updateActiveBlock, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    setValue(newValue);
    setIsOpen(false);
    updateActiveBlock(newValue);

    // Store preference in localStorage
    setStoredLanguage(newValue);

    // Dispatch custom event for global sync
    const event = new CustomEvent('language-preference-changed', {
      detail: { language: newValue },
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  // Listen for language changes from other selectors
  useEffect(() => {
    const handleGlobalChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: string }>;
      const newLang = customEvent.detail.language;

      // Only update if this selector has the language available
      if (languages.includes(newLang) && newLang !== value) {
        setValue(newLang);
        updateActiveBlock(newLang);
      }
    };

    document.addEventListener(
      'language-preference-changed',
      handleGlobalChange,
    );
    return () => {
      document.removeEventListener(
        'language-preference-changed',
        handleGlobalChange,
      );
    };
  }, [languages, value, updateActiveBlock]);

  const currentConfig = languageConfig[value] || { label: value, icon: null };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1 rounded-md',
          'bg-accent/50 border border-border/50',
          'text-sm font-medium text-foreground',
          'hover:bg-accent transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        )}
      >
        <span className="flex items-center justify-center opacity-70">
          {currentConfig.icon}
        </span>
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={cn(
            'size-4 opacity-50 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 z-50',
            'min-w-[140px] py-1 rounded-lg',
            'bg-popover border border-border shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          {languages.map((lang) => {
            const config = languageConfig[lang] || { label: lang, icon: null };
            const isSelected = lang === value;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleSelect(lang)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm',
                  'hover:bg-accent transition-colors',
                  isSelected && 'bg-accent/50 font-medium',
                )}
              >
                <span className="flex items-center justify-center opacity-70 shrink-0">
                  {config.icon}
                </span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
