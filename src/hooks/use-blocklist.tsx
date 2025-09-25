
'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from 'react';

interface BlocklistContextType {
  blocklist: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  isBlocked: (title: string) => boolean;
}

const BlocklistContext = createContext<BlocklistContextType | undefined>(undefined);
const BLOCKLIST_STORAGE_KEY = 'youtube-blocklist';

export function BlocklistProvider({ children }: { children: ReactNode }) {
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedBlocklist = localStorage.getItem(BLOCKLIST_STORAGE_KEY);
      if (storedBlocklist) {
        setBlocklist(JSON.parse(storedBlocklist));
      }
    } catch (error) {
      console.error('Could not access localStorage for blocklist', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(BLOCKLIST_STORAGE_KEY, JSON.stringify(blocklist));
      } catch (error) {
        console.error('Could not access localStorage for blocklist', error);
      }
    }
  }, [blocklist, isMounted]);

  const addKeyword = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (lowerKeyword && !blocklist.includes(lowerKeyword)) {
      setBlocklist([...blocklist, lowerKeyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    setBlocklist(blocklist.filter((k) => k !== keyword.toLowerCase()));
  };

  const isBlocked = useCallback((title: string) => {
    if (!title || !isMounted) return false;
    const lowerTitle = title.toLowerCase();
    return blocklist.some((keyword) => lowerTitle.includes(keyword));
  }, [blocklist, isMounted]);

  return (
    <BlocklistContext.Provider value={{ blocklist, addKeyword, removeKeyword, isBlocked }}>
      {children}
    </BlocklistContext.Provider>
  );
}

export const useBlocklist = (): BlocklistContextType => {
  const context = useContext(BlocklistContext);
  if (context === undefined) {
    throw new Error('useBlocklist must be used within a BlocklistProvider');
  }
  return context;
};
