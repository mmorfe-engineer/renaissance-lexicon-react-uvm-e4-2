/**
 * Lexicon Reducer
 * Pure reducer for managing "Mi Léxico" entries
 */

/**
 * Learning status constants
 */
export const LEARNING_STATUS = {
  NEW: 'Nueva',
  LEARNING: 'Aprendiendo',
  MASTERED: 'Dominada'
};

/**
 * Action types
 */
export const ACTIONS = {
  HYDRATE_ENTRIES: 'HYDRATE_ENTRIES',
  CREATE_ENTRY: 'CREATE_ENTRY',
  UPDATE_ENTRY: 'UPDATE_ENTRY',
  DELETE_ENTRY: 'DELETE_ENTRY'
};

/**
 * Generate unique ID
 * @returns {string} UUID v4
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Check if entry already exists (by word, partOfSpeech, and definition)
 * @param {Array} entries - Current entries
 * @param {Object} newEntry - Entry to check
 * @returns {boolean} True if duplicate exists
 */
function isDuplicate(entries, newEntry) {
  return entries.some(entry =>
    entry.word?.toLowerCase() === newEntry.word?.toLowerCase() &&
    entry.partOfSpeech?.toLowerCase() === newEntry.partOfSpeech?.toLowerCase() &&
    entry.definition?.toLowerCase() === newEntry.definition?.toLowerCase()
  );
}

/**
 * Create initial entry structure
 * @param {Object} data - Data from Dictionary API
 * @returns {Object} Normalized entry
 */
export function createEntry(data) {
  return {
    id: generateId(),
    word: data.word || '',
    phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
    partOfSpeech: data.partOfSpeech || (data.meanings?.[0]?.partOfSpeech || ''),
    definition: data.definition || data.definitions?.[0] || '',
    sourceUrl: data.sourceUrl || data.sourceUrls?.[0] || '',
    notes: '',
    learningStatus: LEARNING_STATUS.NEW,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * Lexicon reducer
 * @param {Array} state - Current state
 * @param {Object} action - Action object
 * @returns {Array} New state
 */
export function lexiconReducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE_ENTRIES:
      // Load entries from persistence
      return action.payload || [];

    case ACTIONS.CREATE_ENTRY: {
      const newEntry = createEntry(action.payload);
      
      // Check for duplicates
      if (isDuplicate(state, newEntry)) {
        return state; // Don't add duplicate
      }
      
      return [...state, newEntry];
    }

    case ACTIONS.UPDATE_ENTRY: {
      const { id, ...updates } = action.payload;
      const updatedAt = Date.now();
      
      return state.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt }
          : entry
      );
    }

    case ACTIONS.DELETE_ENTRY:
      return state.filter(entry => entry.id !== action.payload);

    default:
      return state;
  }
}

export default lexiconReducer;
