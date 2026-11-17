/**
 * useDictionary hook
 * Manages Dictionary API search state
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchDictionary } from '../services/dictionaryApi';
import { useDebounce } from './useDebounce';
import { validateWord } from '../utils/validation';

/**
 * Search status constants
 */
export const SEARCH_STATUS = {
  IDLE: 'idle',
  TYPING: 'typing',
  LOADING: 'loading',
  SUCCESS: 'success',
  NOT_FOUND: 'not_found',
  ERROR: 'error'
};

/**
 * Custom hook for Dictionary API search
 * @param {number} debounceDelay - Debounce delay in ms (default: 450)
 * @returns {Object} Search state and handlers
 */
export function useDictionary(debounceDelay = 450) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(SEARCH_STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const debouncedQuery = useDebounce(query, debounceDelay);

  const search = useCallback(async (searchQuery = query) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Validate query before search
    const validation = validateWord(searchQuery);
    if (!validation.isValid) {
      setStatus(SEARCH_STATUS.ERROR);
      setError(validation.error || 'Invalid word');
      setResult(null);
      return;
    }

    if (!searchQuery || searchQuery.trim() === '') {
      setStatus(SEARCH_STATUS.IDLE);
      setResult(null);
      setError(null);
      return;
    }

    setStatus(SEARCH_STATUS.LOADING);
    setError(null);

    try {
      const data = await fetchDictionary(searchQuery, controller.signal);
      
      // Ignore results if request was cancelled
      if (controller.signal.aborted) {
        return;
      }

      if (data.error) {
        setStatus(data.error === 'Word not found' ? SEARCH_STATUS.NOT_FOUND : SEARCH_STATUS.ERROR);
        setError(data.error);
        setResult(null);
      } else {
        setStatus(SEARCH_STATUS.SUCCESS);
        setResult(data);
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStatus(SEARCH_STATUS.ERROR);
        setError(err.message || 'Network error');
        setResult(null);
      }
    }
  }, [query]);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim() !== '') {
      search(debouncedQuery);
    } else if (debouncedQuery === '') {
      setStatus(SEARCH_STATUS.IDLE);
      setResult(null);
      setError(null);
    }
  }, [debouncedQuery, search]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (query && query.trim() !== '') {
      search(query);
    }
  }, [query, search]);

  return {
    query,
    setQuery,
    status,
    result,
    error,
    search,
    handleSubmit,
    clear: () => {
      setQuery('');
      setStatus(SEARCH_STATUS.IDLE);
      setResult(null);
      setError(null);
    }
  };
}

export default useDictionary;
