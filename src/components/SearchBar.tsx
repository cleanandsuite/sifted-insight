// ============================================================================
// SEARCH BAR COMPONENT
// Header search bar with autocomplete functionality
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Keyboard, Sparkles } from 'lucide-react';
import { useDebounce, useSearchSuggestions } from '@/hooks/useSearch';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showShortcut?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

export const SearchBar = ({
  onSearch,
  placeholder = 'Search articles...',
  showShortcut = true,
  autoFocus = false,
  className = '',
}: SearchBarProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);
  const { suggestions, loading, setQuery: setSuggestionQuery } = useSearchSuggestions();

  // Update suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setSuggestionQuery(debouncedQuery);
    } else {
      setSuggestionQuery('');
    }
  }, [debouncedQuery, setSuggestionQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          setQuery(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        setIsFocused(false);
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
    }
  }, [query, suggestions, selectedIndex]);

  // Perform search
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [navigate, onSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Focus handling
  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 2) {
      setSuggestionQuery(query);
    }
  };

  // Click suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className={`relative w-full max-w-xl ${className}`}>
      {/* Search Input */}
      <div
        className={`
          relative flex items-center
          bg-background border rounded-lg
          transition-all duration-200
          ${isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
        `}
      >
        <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-20 py-2 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          aria-label="Search articles"
          aria-expanded={isFocused}
          aria-controls="search-suggestions"
        />

        {/* Right side actions */}
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          
          {showShortcut && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded border bg-muted/50">
              <Keyboard className="w-3 h-3 text-muted-foreground" />
              <kbd className="text-xs text-muted-foreground">⌘K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (query.length >= 2 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2"
            id="search-suggestions"
            role="listbox"
          >
            <div className="bg-popover border rounded-lg shadow-lg overflow-hidden">
              {/* Loading state */}
              {loading && (
                <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Searching...
                </div>
              )}

              {/* Suggestions list */}
              {!loading && suggestions.length > 0 && (
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={suggestion}>
                      <button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`
                          w-full px-4 py-2 text-left text-sm
                          flex items-center gap-3
                          transition-colors
                          ${index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'}
                        `}
                        role="option"
                        aria-selected={index === selectedIndex}
                      >
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{suggestion}</span>
                        <kbd className="hidden sm:inline-block text-xs text-muted-foreground">
                          Enter
                        </kbd>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* No results */}
              {!loading && query.length >= 2 && suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}

              {/* Recent searches placeholder */}
              {!loading && query.length < 2 && (
                <div className="px-4 py-2 text-xs text-muted-foreground border-b">
                  Type at least 2 characters for suggestions
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut listener */}
      <KeyboardShortcut 
        keyCombo="Meta+K" 
        onTrigger={() => {
          inputRef.current?.focus();
          setIsFocused(true);
        }} 
      />
    </div>
  );
};

// ============================================================================
// KEYBOARD SHORTCUT COMPONENT
// ============================================================================

const KeyboardShortcut = ({ 
  keyCombo, 
  onTrigger 
}: { 
  keyCombo: string; 
  onTrigger: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);

  return null;
};

// ============================================================================
// SEARCH MODAL (Command Palette Style)
// ============================================================================

export const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState('');
  const { suggestions, loading } = useSearchSuggestions();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-popover border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, topics, or sources..."
            className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
          />
          <kbd className="px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Sparkles className="w-6 h-6 animate-pulse mx-auto mb-2" />
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    onClick={() => handleSearch(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
