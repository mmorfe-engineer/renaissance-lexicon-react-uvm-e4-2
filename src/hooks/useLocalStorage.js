/**
 * useLocalStorage hook
 * Persists state to localStorage
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'renaissance-lexicon-react-entries';

/**
 * Parse stored JSON or return default
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if storage is empty/invalid
 * @returns {any} Parsed value or default
 */
function getStoredValue(key, defaultValue) {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save value to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 */
function setStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Custom hook for localStorage persistence
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {[any, function]} State and setter
 */
export function useLocalStorage(key = STORAGE_KEY, initialValue = []) {
  const [storedValue, setStoredValue] = useState(() => {
    return getStoredValue(key, initialValue);
  });

  useEffect(() => {
    setStoredValue(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/**
 * Load entries from localStorage
 * @returns {Array} Array of entries or empty array
 */
export function loadEntries() {
  return getStoredValue(STORAGE_KEY, []);
}

/**
 * Save entries to localStorage
 * @param {Array} entries - Entries to save
 */
export function saveEntries(entries) {
  setStoredValue(STORAGE_KEY, entries);
}

export default useLocalStorage;
