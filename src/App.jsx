/**
 * App component
 * Main application component with ported 4.1 visual design
 */
import {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useRef
} from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import DictionaryResult from './components/DictionaryResult';
import InitialState from './components/InitialState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import LexiconList from './components/LexiconList';
import EntryEditor from './components/EntryEditor';
import Preferences from './components/Preferences';
import StatusMessage from './components/StatusMessage';
import {
  lexiconReducer,
  ACTIONS,
  createEntry,
  prepareUpdate
} from './reducers/lexiconReducer';
import { loadEntries, saveEntries } from './hooks/useLocalStorage';
import { useDictionary, SEARCH_STATUS } from './hooks/useDictionary';

export function App() {
  const [entries, dispatch] = useReducer(lexiconReducer, undefined, loadEntries);
  const dictionary = useDictionary();
  const { query, setQuery, status, result, error, search } = dictionary;
  const searchState = { query, status, result, error };

  const [editingEntry, setEditingEntry] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const editTriggerRef = useRef(null);
  const lexiconHeadingRef = useRef(null);

  useEffect(() => { saveEntries(entries); }, [entries]);

  const searchWord = useCallback((word) => {
    setQuery(word);
    search(word);
  }, [setQuery, search]);

  const handleSaveToLexicon = useCallback((dictionaryResult) => {
    const exists = entries.some(
      (entry) =>
        entry.word?.toLowerCase() === dictionaryResult.word?.toLowerCase()
    );

    if (exists) {
      setStatusMessage({
        message: `${dictionaryResult.word} ya está en Mi Léxico`,
        type: 'warning'
      });
      return;
    }

    const newEntry = createEntry({
      word: dictionaryResult.word,
      phonetic: dictionaryResult.phonetic,
      partOfSpeech:
        dictionaryResult.partOfSpeech ||
        dictionaryResult.meanings?.[0]?.partOfSpeech ||
        '',
      definition: dictionaryResult.definitions?.[0] ||
                   dictionaryResult.meanings?.[0]?.definitions?.[0]?.definition || '',
      sourceUrl: dictionaryResult.sourceUrls?.[0] || ''
    });

    dispatch({ type: ACTIONS.CREATE_ENTRY, payload: newEntry });
    setStatusMessage({
      message: `${dictionaryResult.word} añadida a Mi Léxico`,
      type: 'success'
    });
  }, [entries]);

  const restoreEditFocus = useCallback(() => {
    const target = editTriggerRef.current;
    requestAnimationFrame(() => {
      if (target?.isConnected) target.focus();
    });
  }, []);

  const handleEditEntry = useCallback((entry, triggerElement) => {
    editTriggerRef.current = triggerElement || null;
    setEditingEntry(entry);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
    restoreEditFocus();
  }, [restoreEditFocus]);

  const handleSaveEditedEntry = useCallback((updatedEntry) => {
    const originalEntry = entries.find(
      (entry) => entry.id === updatedEntry.id
    );

    if (!originalEntry) return;

    const updatePayload = prepareUpdate(originalEntry, updatedEntry);
    dispatch({ type: ACTIONS.UPDATE_ENTRY, payload: updatePayload });
    setEditingEntry(null);
    setStatusMessage({
      message: `${updatedEntry.word} actualizada`,
      type: 'success'
    });
    restoreEditFocus();
  }, [entries, restoreEditFocus]);

  const handleDeleteEntry = useCallback((entryId) => {
    const entryToDelete = entries.find((entry) => entry.id === entryId);
    if (!entryToDelete) return;

    dispatch({ type: ACTIONS.DELETE_ENTRY, payload: entryId });
    setStatusMessage({
      message: `${entryToDelete.word} eliminada de Mi Léxico`,
      type: 'success'
    });

    requestAnimationFrame(() => {
      lexiconHeadingRef.current?.focus();
    });
  }, [entries]);

  const handleRetry = useCallback(() => search(query), [search, query]);

  // Check if we should show initial state
  const showInitialState = searchState.status === SEARCH_STATUS.IDLE &&
                            (searchState.query === '' || searchState.query.trim() === '') &&
                            !searchState.result &&
                            !searchState.error;

  // Check if we should show loading state
  const showLoadingState = searchState.status === SEARCH_STATUS.LOADING;

  // Check if we should show error state
  const showErrorState = searchState.status === SEARCH_STATUS.ERROR ||
                         searchState.status === SEARCH_STATUS.NOT_FOUND;

  // Check if we should show result
  const showResult = searchState.status === SEARCH_STATUS.SUCCESS && searchState.result;

  return (
    <div className="app">
      <Header />

      <main id="main" className="wrap" tabIndex={-1}>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">EL LENGUAJE ABRE POSIBILIDADES</p>
          <h1 id="page-title">
            Una palabra.<br />
            <em>Un nuevo significado.</em>
          </h1>
          <p className="intro-copy">
            Explora el inglés, definición a definición. Encuentra su significado,
            descubre cómo suena y sigue aprendiendo.
          </p>
        </section>

        <section className="dictionary" aria-label="Diccionario de inglés">
          <div className="preferences">
            <p className="section-label">
              <span className="small-dot" aria-hidden="true"></span>
              Tu espacio de lectura
            </p>
            <Preferences />
          </div>

          <SearchForm dictionary={dictionary} />

          {statusMessage && (
            <StatusMessage
              message={statusMessage.message}
              type={statusMessage.type}
              onDismiss={() => setStatusMessage(null)}
            />
          )}

          {showInitialState && (
            <InitialState onSuggestionClick={searchWord} />
          )}

          {showLoadingState && (
            <LoadingState word={searchState.query} />
          )}

          {showErrorState && (
            <ErrorState
              kind={searchState.status === SEARCH_STATUS.NOT_FOUND ? 'not-found' : 'error'}
              message={searchState.error || 'Ocurrió un error al buscar la palabra.'}
              onRetry={handleRetry}
            />
          )}

          {showResult && (
            <DictionaryResult
              result={searchState.result}
              onSave={handleSaveToLexicon}
              onSearch={searchWord}
            />
          )}

          <section className="lexicon-section">
            <LexiconList
              entries={entries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              headingRef={lexiconHeadingRef}
            />
          </section>
        </section>

        <aside className="reading-note">
          <span aria-hidden="true">Aa</span>
          <p>
            Aprender empieza con curiosidad.<br />
            <strong>Haz de cada palabra un descubrimiento.</strong>
          </p>
        </aside>
      </main>

      <footer className="site-footer wrap">
        <p>
          <strong>Renaissance Lexicon</strong>
          <br />
          Universidad Valle del Momboy · FrontEndIVIVFI2026C
        </p>
        <div>
          <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener noreferrer">
            Dictionary API ↗
          </a>
          <a
            href="https://github.com/mmorfe-engineer/renaissance-lexicon-react-uvm-e4-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Código en GitHub ↗
          </a>
        </div>
      </footer>

      {editingEntry && (
        <EntryEditor
          entry={editingEntry}
          onSave={handleSaveEditedEntry}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default App;
