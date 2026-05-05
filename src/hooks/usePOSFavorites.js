import { useState, useCallback } from "react";

const KEY = (userId) => `agrinest_pos_favorites_${userId || "default"}`;
const MAX  = 8;

const load = (userId) => {
  try { return JSON.parse(localStorage.getItem(KEY(userId)) || "[]"); }
  catch { return []; }
};

const save = (userId, ids) =>
  localStorage.setItem(KEY(userId), JSON.stringify(ids));

/**
 * usePOSFavorites
 * Manages a list of pinned product IDs for the POS screen.
 * Persisted per user in localStorage.
 */
const usePOSFavorites = (userId) => {
  const [favoriteIds, setFavoriteIds] = useState(() => load(userId));

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (productId) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : prev.length >= MAX
          ? prev  // silently cap at MAX
          : [...prev, productId];
        save(userId, next);
        return next;
      });
    },
    [userId]
  );

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    save(userId, []);
  }, [userId]);

  return { favoriteIds, isFavorite, toggleFavorite, clearFavorites, maxFavorites: MAX };
};

export default usePOSFavorites;
