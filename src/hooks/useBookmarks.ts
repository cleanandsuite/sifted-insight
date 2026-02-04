import { useState, useEffect, useCallback } from 'react';

const BOOKMARKS_KEY = 'sift_bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  // Save bookmarks to localStorage when they change
  const saveBookmarks = useCallback((newBookmarks: string[]) => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  }, []);

  const addBookmark = useCallback((articleId: string) => {
    const updated = [...bookmarks, articleId];
    saveBookmarks(updated);
  }, [bookmarks, saveBookmarks]);

  const removeBookmark = useCallback((articleId: string) => {
    const updated = bookmarks.filter(id => id !== articleId);
    saveBookmarks(updated);
  }, [bookmarks, saveBookmarks]);

  const toggleBookmark = useCallback((articleId: string) => {
    if (bookmarks.includes(articleId)) {
      removeBookmark(articleId);
    } else {
      addBookmark(articleId);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((articleId: string) => {
    return bookmarks.includes(articleId);
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  };
};
