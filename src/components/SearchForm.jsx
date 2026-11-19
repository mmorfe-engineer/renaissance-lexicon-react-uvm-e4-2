/**
 * SearchForm component
 * Controlled input for dictionary search with validation
 * Ported from 4.1 visual design
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { SEARCH_STATUS } from '../hooks/useDictionary';
import { validateWord } from '../utils/validation';

// SVG search icon from 4.1
const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 5 5" />
  </svg>
);

export function SearchForm({ dictionary }) {
  const { query, setQuery, status, search } = dictionary;

  const inputRef = useRef(null);
  const [validationError, setValidationError] = useState(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Clear validation error when query changes
  useEffect(() => {
    if (query.trim() === '') {
      setValidationError(null);
    }
  }, [query]);

  const handleChange = useCallback((e) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();

    const trimmedQuery = query.trim();

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
  }, [query, search]);

  const isLoading = status === SEARCH_STATUS.LOADING;

  return (
    <form onSubmit={handleSubmit} id="search-form" role="search" noValidate>
      <label className="search-label" htmlFor="word">
        ¿Qué palabra quieres descubrir?
      </label>

      <div className="search-box">
        <SearchIcon />
        <input
          ref={inputRef}
          id="word"
          name="word"
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Escribe una palabra en inglés…"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          maxLength={80}
          aria-describedby="search-help validation"
          aria-invalid={!!validationError}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !query.trim() || !!validationError}>
          Buscar <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="search-notes">
        <p id="search-help">Diccionario en inglés · Búsqueda automática al dejar de escribir.</p>
        <span>Dictionary API</span>
      </div>

      {validationError && (
        <p id="validation" className="validation" role="alert">
          {validationError}
        </p>
      )}


    </form>
  );
}

export default SearchForm;
