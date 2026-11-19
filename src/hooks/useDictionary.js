/**
 * useDictionary hook
 * Manages Dictionary API search state
 * Ported from 4.1 with proper error handling
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
  const lastSearchRef = useRef('');
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Message for screen readers
  const statusEl = useRef(null);

  const announce = useCallback((message) => {
    if (statusEl.current) {
      statusEl.current.textContent = message;
    }
  }, []);

  const search = useCallback(async (searchQuery) => {
    lastSearchRef.current = searchQuery;
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
      announce(validation.error || 'Invalid word');
      return;
    }

    if (!searchQuery || searchQuery.trim() === '') {
      setStatus(SEARCH_STATUS.IDLE);
      setResult(null);
      setError(null);
      announce('Escribe una palabra en ingl\u00e9s para empezar.');
      return;
    }

    setStatus(SEARCH_STATUS.LOADING);
    setError(null);
    announce(`Buscando ${searchQuery}.`);

    // Set timeout for slow connections
    const timeout = setTimeout(() => {
      controller.abort();
      setStatus(SEARCH_STATUS.ERROR);
      setError('La búsqueda tardó demasiado. Inténtalo de nuevo.');
    }, 12000);

    try {
      const data = await fetchDictionary(searchQuery, controller.signal);
      
      // Ignore results if request was cancelled
      if (controller.signal.aborted) {
        clearTimeout(timeout);
        return;
      }

      clearTimeout(timeout);

      if (data.error) {
        const errorMessage = getErrorMessage(data.error);
        const errorKind = data.error === 'Word not found' ? 'not-found' : 'api';
        setStatus(errorKind === 'not-found' ? SEARCH_STATUS.NOT_FOUND : SEARCH_STATUS.ERROR);
        setError(errorMessage);
        setResult(null);
        announce(errorMessage);
      } else {
        setStatus(SEARCH_STATUS.SUCCESS);
        setResult(data);
        setError(null);
        announce(`${data.meanings?.length || 1} entrada${(data.meanings?.length || 1) === 1 ? '' : 's'} encontrada${(data.meanings?.length || 1) === 1 ? '' : 's'} para ${data.word}.`);
      }
    } catch (err) {
      clearTimeout(timeout);

      if (err.name !== 'AbortError') {
        setStatus(SEARCH_STATUS.ERROR);
        setError('No pudimos conectar con el diccionario. Revisa tu conexi\u00f3n e int\u00e9ntalo otra vez.');
        setResult(null);
        announce('Error de conexi\u00f3n.');
      }
    }
  }, [announce]);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim() !== '' && debouncedQuery !== lastSearchRef.current) {
      search(debouncedQuery);
    } else if (debouncedQuery === '' && query === '') {
      lastSearchRef.current = '';
      setStatus(SEARCH_STATUS.IDLE);
      setResult(null);
      setError(null);
      announce('Escribe una palabra en ingl\u00e9s para empezar.');
    }
  }, [debouncedQuery, search, announce]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (query && query.trim() !== '') {
      search(query, true);
    }
  }, [query, search]);

  // Helper to get proper error messages
  const getErrorMessage = (error) => {
    switch (error) {
      case 'Word not found':
        return 'No encontramos esta palabra. Revisa c\u00f3mo se escribe o prueba otra palabra en ingl\u00e9s.';
      case 'Request cancelled':
        return '';
      case 'Empty word':
        return 'Escribe una palabra para buscar.';
      case 'Invalid word':
        return 'Palabra inv\u00e1lida.';
      case 'Network error':
        return 'No pudimos conectar con el diccionario. Revisa tu conexi\u00f3n e int\u00e9ntalo otra vez.';
      default:
        return 'No pudimos conectar con el diccionario. Inténtalo de nuevo.';
    }
  };

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
