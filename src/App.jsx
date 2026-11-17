/**
 * App component
 * Main application component
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
import { SEARCH_STATUS } from './hooks/useDictionary';

export function App() {
  const [entries, dispatch] = useReducer(lexiconReducer, []);

  const [searchState, setSearchState] = useState({
    query: '',
    status: SEARCH_STATUS.IDLE,
    result: null,
    error: null
  });

  const [editingEntry, setEditingEntry] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const editTriggerRef = useRef(null);
  const lexiconHeadingRef = useRef(null);

  useEffect(() => {
    const savedEntries = loadEntries();
    if (savedEntries && savedEntries.length > 0) {
      dispatch({ type: ACTIONS.HYDRATE_ENTRIES, payload: savedEntries });
    }
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const handleSearchComplete = useCallback((result) => {
    setSearchState((previous) => ({
      ...previous,
      result,
      status: SEARCH_STATUS.SUCCESS,
      error: null
    }));
  }, []);

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
      definition: dictionaryResult.definitions?.[0] || '',
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

  return (
    <div className="app">
      <Header />
      <Preferences />

      <main className="main-content">
        <section className="search-section">
          <SearchForm onSearchComplete={handleSearchComplete} />

          {statusMessage && (
            <StatusMessage
              message={statusMessage.message}
              type={statusMessage.type}
              onDismiss={() => setStatusMessage(null)}
            />
          )}

          {searchState.result && (
            <DictionaryResult
              result={searchState.result}
              onSave={handleSaveToLexicon}
            />
          )}
        </section>

        <section className="lexicon-section">
          <LexiconList
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            headingRef={lexiconHeadingRef}
          />
        </section>
      </main>

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
