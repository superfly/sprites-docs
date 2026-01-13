/**
 * Shared language configuration for code snippets and tabs.
 * Used across CodeTabs, CodeSnippets.astro, and SnippetSelector.
 */

/** Display labels for language identifiers */
export const languageLabels: Record<string, string> = {
  cli: 'CLI',
  bash: 'Bash',
  curl: 'cURL',
  go: 'Go',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  elixir: 'Elixir',
  macos: 'macOS',
  linux: 'Linux',
  windows: 'Windows',
  json: 'JSON',
};

/** Maps language identifiers to syntax highlighting language */
export const syntaxLanguageMap: Record<string, string> = {
  cli: 'bash',
  bash: 'bash',
  curl: 'bash',
  go: 'go',
  javascript: 'typescript',
  typescript: 'typescript',
  python: 'python',
  elixir: 'elixir',
  json: 'json',
};

/** Get display label for a language identifier */
export function getLanguageLabel(language: string): string {
  return (
    languageLabels[language.toLowerCase()] ||
    language.charAt(0).toUpperCase() + language.slice(1)
  );
}

/** Get syntax highlighting language for a language identifier */
export function getSyntaxLanguage(language: string): string {
  return syntaxLanguageMap[language.toLowerCase()] || 'text';
}
