/**
 * App component
 * Main application component
 */
import { useState, useReducer, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import DictionaryResult from './components/DictionaryResult';
import LexiconList from './components/LexiconList';
import EntryEditor from './components/EntryEditor';
import StatusMessage from './components/StatusMessage';
import { lexiconReducer, ACTIONS, LEARNING_STATUS, createEntry } from './reducers/lexiconReducer';
import { loadEntries, saveEntries } from './hooks/useLocalStorage';
import { SEARCH_STATUS } from './hooks/useDictionary';

export function App() {
  // State for lexicon entries (useReducer)
  const [entries, dispatch] = useReducer(lexiconReducer, []);

  // State for dictionary search
  const [searchState, setSearchState] = useState({
    query: '',
    status: SEARCH_STATUS.IDLE,
    result: null,
    error: null
  });

  // State for editor
  const [editingEntry, setEditingEntry] = useState(null);

  // State for status messages
  const [statusMessage, setStatusMessage] = useState(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = loadEntries();
    if (savedEntries && savedEntries.length > 0) {
      dispatch({ type: ACTIONS.HYDRATE_ENTRIES, payload: savedEntries });
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0) {
      saveEntries(entries);
    }
  }, [entries]);

  // Handle dictionary search completion
  const handleSearchComplete = useCallback((result) => {
    setSearchState(prev => ({ ...prev, result, status: SEARCH_STATUS.SUCCESS, error: null }));
  }, []);

  // Handle save to lexicon
  const handleSaveToLexicon = useCallback((dictionaryResult) => {
    // Check if already exists
    const exists = entries.some(entry =>
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
      partOfSpeech: dictionaryResult.partOfSpeech || (dictionaryResult.meanings?.[0]?.partOfSpeech || ''),
      definition: dictionaryResult.definitions?.[0] || '',
      sourceUrl: dictionaryResult.sourceUrls?.[0] || '',
      notes: '',
      learningStatus: LEARNING_STATUS.NEW
    });

    dispatch({ type: ACTIONS.CREATE_ENTRY, payload: newEntry });
    setStatusMessage({ 
      message: `${dictionaryResult.word} añadida a Mi Léxico`,
      type: 'success'
    });
  }, [entries]);

  // Handle edit entry
  const handleEditEntry = useCallback((entry) => {
    setEditingEntry(entry);
  }, []);

  // Handle save edited entry
  const handleSaveEditedEntry = useCallback((updatedEntry) => {
    dispatch({ type: ACTIONS.UPDATE_ENTRY, payload: updatedEntry });
    setEditingEntry(null);
    setStatusMessage({ 
      message: `${updatedEntry.word} actualizada`,
      type: 'success'
    });
  }, []);

  // Handle delete entry
  const handleDeleteEntry = useCallback((entryId) => {
    const entryToDelete = entries.find(e => e.id === entryId);
    if (entryToDelete) {
      // Simple confirmation - just delete
      dispatch({ type: ACTIONS.DELETE_ENTRY, payload: entryId });
      setStatusMessage({ 
        message: `${entryToDelete.word} eliminada de Mi Léxico`,
        type: 'success'
      });
    }
  }, [entries]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      status: SEARCH_STATUS.IDLE,
      result: null,
      error: null
    });
  }, []);

  return (
    <div className="app">
      <Header />
      
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
          />
        </section>
      </main>

      {editingEntry && (
        <EntryEditor
          entry={editingEntry}
          onSave={handleSaveEditedEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}

export default App;
