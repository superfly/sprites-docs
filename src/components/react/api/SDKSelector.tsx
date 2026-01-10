'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SDKLanguage = 'cli' | 'go' | 'javascript' | 'python' | 'elixir';

interface SDKSelectorProps {
  value: SDKLanguage;
  onChange: (value: SDKLanguage) => void;
}

const languages: { value: SDKLanguage; label: string; icon: string }[] = [
  { value: 'cli', label: 'CLI', icon: '>' },
  { value: 'go', label: 'Go', icon: 'Go' },
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'python', label: 'Python', icon: 'Py' },
  { value: 'elixir', label: 'Elixir', icon: 'Ex' },
];

export function SDKSelector({ value, onChange }: SDKSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-9 bg-[var(--snippet-title-bg)] border-[var(--snippet-border)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs w-5">{lang.icon}</span>
              <span>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
