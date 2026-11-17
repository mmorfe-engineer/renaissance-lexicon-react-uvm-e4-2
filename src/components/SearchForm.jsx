/**
 * SearchForm component
 * Controlled input for dictionary search with validation
 */
import { useRef, useEffect, useState } from 'react';
import { useDictionary, SEARCH_STATUS } from '../hooks/useDictionary';
import { validateWord } from '../utils/validation';

export function SearchForm({ onSearchComplete }) {
  const { 
    query, 
    setQuery, 
    status, 
    result, 
    error,
    search,
    clear 
  } = useDictionary();

  const inputRef = useRef(null);
  const [validationError, setValidationError] = useState(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Notify parent when search completes
  useEffect(() => {
    if (status === SEARCH_STATUS.SUCCESS && result && onSearchComplete) {
      onSearchComplete(result);
    }
  }, [status, result, onSearchComplete]);

  // Clear validation error when query changes
  useEffect(() => {
    if (query.trim() === '') {
      setValidationError(null);
    }
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    // Validate on change
    const trimmed = e.target.value.trim();
    if (trimmed) {
      const validation = validateWord(trimmed);
      setValidationError(validation.isValid ? null : validation.error);
    } else {
      setValidationError(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    const trimmedQuery = query.trim();
    
    // Validate before search
    if (!trimmedQuery) {
      return;
    }
    
    const validation = validateWord(trimmedQuery);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }
    
    setValidationError(null);
    search(trimmedQuery);
  };

  const isLoading = status === SEARCH_STATUS.LOADING;
  const hasApiError = status === SEARCH_STATUS.ERROR || status === SEARCH_STATUS.NOT_FOUND;

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-wrapper">
        <label htmlFor="search-input" className="visually-hidden">
          Buscar palabra
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar palabra (ej: house)"
          aria-label="Buscar palabra"
          aria-busy={isLoading}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? 'validation-error' : undefined}
          disabled={isLoading}
          className="search-input"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim() || !!validationError}
          className="search-button"
          aria-label="Buscar"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {hasApiError && (
        <p className="search-error" role="alert">
          {error === 'Word not found' ? 'Palabra no encontrada' : error}
        </p>
      )}
      {validationError && (
        <p className="search-error" id="validation-error" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}

export default SearchForm;
