/**
 * SearchForm component
 * Controlled input for dictionary search
 */
import { useRef, useEffect } from 'react';
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
    handleSubmit,
    clear 
  } = useDictionary();

  const inputRef = useRef(null);

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

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isLoading = status === SEARCH_STATUS.LOADING;
  const hasError = status === SEARCH_STATUS.ERROR || status === SEARCH_STATUS.NOT_FOUND;

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
          disabled={isLoading}
          className="search-input"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="search-button"
          aria-label="Buscar"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {hasError && (
        <p className="search-error" role="alert">
          {error === 'Word not found' ? 'Palabra no encontrada' : error}
        </p>
      )}
    </form>
  );
}

export default SearchForm;
