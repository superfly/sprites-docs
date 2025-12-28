import { motion } from 'motion/react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { AnimatedItem } from './AnimatedList';

// Types for Pagefind
interface PagefindSubResult {
  url: string;
  title: string;
  excerpt: string;
  anchor?: {
    element: string;
    id: string;
    text: string;
  };
}

interface PagefindResult {
  id: string;
  url: string;
  excerpt: string;
  content: string;
  meta: {
    title: string;
    image?: string;
  };
  sub_results: PagefindSubResult[];
  anchors: Array<{
    element: string;
    id: string;
    text: string;
    location: number;
  }>;
}

interface PagefindSearchResult {
  results: Array<{
    id: string;
    score: number;
    data: () => Promise<PagefindResult>;
  }>;
}

interface Pagefind {
  init: () => Promise<void>;
  options: (opts: Record<string, unknown>) => Promise<void>;
  search: (
    query: string,
    options?: Record<string, unknown>,
  ) => Promise<PagefindSearchResult | null>;
  debouncedSearch: (
    query: string,
    options?: Record<string, unknown>,
    timeout?: number,
  ) => Promise<PagefindSearchResult | null>;
  preload: (query: string, options?: Record<string, unknown>) => Promise<void>;
  destroy: () => Promise<void>;
}

declare global {
  interface Window {
    pagefind?: Pagefind;
  }
}

// Flattened item for navigation
interface SelectableItem {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  type: 'page' | 'section';
  isLastInGroup: boolean;
}

// Main page result item
const PageResultItem: React.FC<{
  item: SelectableItem;
  isSelected: boolean;
}> = ({ item, isSelected }) => {
  return (
    <div
      className={cn(
        'px-3 py-2.5 rounded-md transition-colors border border-transparent',
        isSelected ? 'bg-accent border-ring/50' : 'hover:bg-muted',
      )}
    >
      <div className="flex items-center gap-3">
        <svg
          className={cn(
            'w-4 h-4 flex-shrink-0',
            isSelected ? 'text-primary' : 'text-muted-foreground',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span
          className={cn(
            'text-sm font-medium flex-1',
            isSelected ? 'text-accent-foreground' : 'text-foreground',
          )}
        >
          {item.title}
        </span>
        <Kbd
          className={cn(
            'transition-opacity',
            isSelected ? 'opacity-100' : 'opacity-0',
          )}
        >
          Enter
        </Kbd>
      </div>
    </div>
  );
};

// Sub-result item with tree connector
const SectionResultItem: React.FC<{
  item: SelectableItem;
  isSelected: boolean;
}> = ({ item, isSelected }) => {
  return (
    <div className="flex items-stretch">
      {/* Tree connector */}
      <div className="w-7 ml-5 flex items-center justify-center relative">
        {/* Vertical line */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-px bg-border',
            item.isLastInGroup ? 'top-0 h-1/2' : 'inset-y-0',
          )}
        />
        {/* Horizontal line */}
        <div className="absolute left-1/2 w-3 h-px bg-border" />
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 px-3 py-2 rounded-md transition-colors border border-transparent',
          isSelected ? 'bg-accent border-ring/50' : 'hover:bg-muted',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'text-sm font-medium',
                isSelected ? 'text-accent-foreground' : 'text-foreground',
              )}
            >
              {item.title}
            </div>
            {item.excerpt && (
              <div
                className="text-xs text-muted-foreground mt-1 line-clamp-2 [&_mark]:bg-yellow-500/30 [&_mark]:text-inherit [&_mark]:rounded-sm"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: pagefind sanitizes excerpts
                dangerouslySetInnerHTML={{ __html: item.excerpt }}
              />
            )}
          </div>
          <Kbd
            className={cn(
              'flex-shrink-0 transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-0',
            )}
          >
            Enter
          </Kbd>
        </div>
      </div>
    </div>
  );
};

export interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);
  const [pagefindReady, setPagefindReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchIdRef = useRef<number>(0);

  // Load Pagefind once on mount
  useEffect(() => {
    const loadPagefind = async () => {
      if (window.pagefind) {
        setPagefindReady(true);
        return;
      }

      try {
        const pagefindPath = '/pagefind/pagefind.js';
        const module = await (Function(
          `return import("${pagefindPath}")`,
        )() as Promise<Pagefind>);
        window.pagefind = module;

        // Configure options
        await module.options({
          excerptLength: 20,
          highlightParam: 'highlight',
        });

        setPagefindReady(true);
      } catch (error) {
        console.error('Failed to load Pagefind:', error);
      }
    };

    loadPagefind();
  }, []);

  // Flatten results into selectable items
  const selectableItems = useMemo((): SelectableItem[] => {
    const items: SelectableItem[] = [];

    results.forEach((result) => {
      // Get sub_results, filtering out the main page URL if it appears first
      const subResults = result.sub_results || [];
      const sections = subResults.filter((sub, idx) => {
        // Keep if URL has a hash (it's a section link)
        if (sub.url.includes('#')) return true;
        // Skip first item if it's just the page URL without hash
        if (idx === 0 && sub.url === result.url) return false;
        return true;
      });

      // Add main page result
      items.push({
        id: result.id,
        url: result.url,
        title: result.meta.title || 'Untitled',
        excerpt: '',
        type: 'page',
        isLastInGroup: sections.length === 0,
      });

      // Add section results (limit to 3)
      sections.slice(0, 3).forEach((sub, idx) => {
        items.push({
          id: `${result.id}-${idx}`,
          url: sub.url,
          title: sub.title || sub.anchor?.text || 'Section',
          excerpt: sub.excerpt || '',
          type: 'section',
          isLastInGroup: idx === Math.min(sections.length, 3) - 1,
        });
      });
    });

    return items;
  }, [results]);

  // Focus input and blur page content when dialog opens
  useEffect(() => {
    const unlockScroll = () => {
      const scrollY = document.body.style.top;
      document.body.classList.remove('search-dialog-open');
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY, 10) * -1);
      }
    };

    if (isOpen) {
      // Save scroll position before locking
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('search-dialog-open');
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    } else {
      unlockScroll();
    }

    return unlockScroll;
  }, [isOpen]);

  // Search effect with manual debouncing
  useEffect(() => {
    // Increment search ID to invalidate any pending searches
    const currentSearchId = ++searchIdRef.current;

    // Clear results immediately when query is empty
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    if (!window.pagefind) {
      return;
    }

    setIsLoading(true);

    // Preload indexes for faster search
    if (query.length >= 2) {
      window.pagefind.preload(query);
    }

    // Debounce the actual search
    const timeoutId = setTimeout(async () => {
      // Check if this search is still valid
      if (searchIdRef.current !== currentSearchId) {
        return;
      }

      try {
        const search = await window.pagefind?.search(query);

        // Check again after async operation
        if (searchIdRef.current !== currentSearchId) {
          return;
        }

        if (!search || search.results.length === 0) {
          setResults([]);
          setSelectedIndex(0);
          setIsLoading(false);
          return;
        }

        // Load first 6 page results
        const loadedResults = await Promise.all(
          search.results.slice(0, 6).map((r) => r.data()),
        );

        // Final check before setting state
        if (searchIdRef.current !== currentSearchId) {
          return;
        }

        setResults(loadedResults);
        setSelectedIndex(0);
        setIsLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        if (searchIdRef.current === currentSearchId) {
          setResults([]);
          setIsLoading(false);
        }
      }
    }, 150);

    // Cleanup: clear timeout if query changes before it fires
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  // Handle scroll for gradients
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  // Check initial scroll state
  useEffect(() => {
    if (!listRef.current || selectableItems.length === 0) {
      setBottomGradientOpacity(0);
      return;
    }
    const { scrollHeight, clientHeight } = listRef.current;
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : 1);
  }, [selectableItems]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, selectableItems.length - 1),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectableItems[selectedIndex]) {
            window.location.href = selectableItems[selectedIndex].url;
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectableItems, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;

    const selectedItem = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;

    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-6 sm:pt-[10vh] sm:px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/70"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-2xl bg-popover border border-border rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg
            className="w-5 h-5 text-muted-foreground flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              pagefindReady ? 'Search documentation...' : 'Loading search...'
            }
            disabled={!pagefindReady}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm disabled:opacity-50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <Kbd className="hidden sm:inline-flex">Esc</Kbd>
        </div>

        {/* Results count */}
        {!isLoading && query && results.length > 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            {results.length} result{results.length !== 1 ? 's' : ''} for "
            {query}"
          </div>
        )}

        {/* Results - only show when there's a query */}
        {query && (
          <div className="relative">
            <div
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              onScroll={handleScroll}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border) transparent',
              }}
            >
              {isLoading ? (
                <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Searching...</span>
                </div>
              ) : selectableItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                selectableItems.map((item, index) => (
                  <AnimatedItem
                    key={item.id}
                    index={index}
                    delay={0.03}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      window.location.href = item.url;
                      onClose();
                    }}
                  >
                    {item.type === 'section' ? (
                      <SectionResultItem
                        item={item}
                        isSelected={selectedIndex === index}
                      />
                    ) : (
                      <PageResultItem
                        item={item}
                        isSelected={selectedIndex === index}
                      />
                    )}
                  </AnimatedItem>
                ))
              )}
            </div>

            {/* Gradient overlays */}
            <div
              className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-popover to-transparent pointer-events-none transition-opacity duration-300"
              style={{ opacity: topGradientOpacity }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-popover to-transparent pointer-events-none transition-opacity duration-300"
              style={{ opacity: bottomGradientOpacity }}
            />
          </div>
        )}

        {/* Footer */}
        {selectableItems.length > 0 && (
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center justify-end gap-4">
            <span className="flex items-center gap-1">
              <KbdGroup>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </KbdGroup>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span className="ml-1">Open</span>
            </span>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
};

export default SearchDialog;
