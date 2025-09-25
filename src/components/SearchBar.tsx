
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, History } from 'lucide-react';

const MAX_HISTORY = 5;

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(searchParams.get('query') || '');
  }, [searchParams]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedHistory = localStorage.getItem('youtubeSearchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const handleSearch = (e: React.FormEvent, searchQuery: string) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    updateSearchHistory(trimmedQuery);
    router.push(`/?query=${encodeURIComponent(trimmedQuery)}`);
    setIsFocused(false);
    // Also blur the input on search
    if (wrapperRef.current) {
        const input = wrapperRef.current.querySelector('input');
        if (input) {
            input.blur();
        }
    }
  };

  const updateSearchHistory = (newQuery: string) => {
    try {
      const updatedHistory = [newQuery, ...searchHistory.filter((h) => h !== newQuery)].slice(0, MAX_HISTORY);
      setSearchHistory(updatedHistory);
      localStorage.setItem('youtubeSearchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
  }

  if (!isMounted) {
      return (
        <div className="relative w-full max-w-lg">
            <div className="h-10 w-full rounded-full bg-muted animate-pulse" />
        </div>
      )
  }

  return (
    <div className="relative w-full max-w-lg" ref={wrapperRef}>
      <form onSubmit={(e) => handleSearch(e, query)} className="relative w-full">
        <Input
          type="text"
          placeholder="Search for videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="h-10 w-full rounded-full pl-5 pr-12"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full hover:bg-primary/20"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
      </form>
       {isFocused && searchHistory.length > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-md border bg-card p-2 shadow-lg">
          <ul className="space-y-1">
            {searchHistory.map((item, index) => (
              <li key={index}>
                 <button
                  onClick={(e) => {
                    setQuery(item);
                    handleSearch(e, item);
                  }}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-accent/50"
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span>{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
