import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hackhunt_saved_hackathons';

export function useSavedHackathons() {
  const [savedHackathons, setSavedHackathons] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedHackathons(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load saved hackathons', err);
    }
  }, []);

  const saveHackathon = (item) => {
    setSavedHackathons((prev) => {
      if (prev.some((h) => h.id === item.id)) return prev;
      const updated = [...prev, item];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const unsaveHackathon = (id) => {
    setSavedHackathons((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isSaved = (id) => {
    return savedHackathons.some((h) => h.id === id);
  };

  return { savedHackathons, saveHackathon, unsaveHackathon, isSaved };
}
