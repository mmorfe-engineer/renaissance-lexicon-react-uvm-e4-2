/**
 * useDebounce hook
 * Delays a value change until after a specified delay
 */
import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 450ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 450) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
