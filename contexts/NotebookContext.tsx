
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type NotebookEntry } from '../types';

interface NotebookContextType {
  entries: NotebookEntry[];
  addEntry: (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  removeEntries: (ids: string[]) => void;
  updateEntry: (id: string, updates: Partial<Omit<NotebookEntry, 'id' | 'timestamp'>>) => void;
  clearNotebook: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode; articleId: string }> = ({ children, articleId }) => {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from storage on mount/article change
  useEffect(() => {
    const stored = localStorage.getItem(`notebook-${articleId}`);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notebook", e);
      }
    } else {
      setEntries([]);
    }
  }, [articleId]);

  // Save to storage on change
  useEffect(() => {
    localStorage.setItem(`notebook-${articleId}`, JSON.stringify(entries));
  }, [entries, articleId]);

  const addEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    const newEntry: NotebookEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: Date.now(),
    };
    setEntries(prev => [newEntry, ...prev]); // Newest first
    setIsOpen(true); // Auto open when adding
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const removeEntries = (ids: string[]) => {
    setEntries(prev => prev.filter(e => !ids.includes(e.id)));
  };

  const updateEntry = (id: string, updates: Partial<Omit<NotebookEntry, 'id' | 'timestamp'>>) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  };

  const clearNotebook = () => {
    setEntries([]);
  };

  return (
    <NotebookContext.Provider value={{ entries, addEntry, removeEntry, removeEntries, updateEntry, clearNotebook, isOpen, setIsOpen }}>
      {children}
    </NotebookContext.Provider>
  );
};

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error("useNotebook must be used within a NotebookProvider");
  }
  return context;
};
