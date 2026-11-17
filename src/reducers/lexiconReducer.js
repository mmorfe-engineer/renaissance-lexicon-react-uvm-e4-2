/**
 * Lexicon Reducer
 * Pure reducer for managing "Mi Lexicon" entries
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
 * Lexicon reducer - PURE FUNCTION
 * Does NOT generate IDs, timestamps, or randomness.
 * Only validates duplicates and performs immutable updates.
 * 
 * @param {Array} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Array} New state
 */
export function lexiconReducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE_ENTRIES:
      // Load entries from persistence - return payload as-is
      return action.payload || [];

    case ACTIONS.CREATE_ENTRY: {
      // Payload must be a complete entry with id, timestamps, etc.
      // Reducer only validates duplicate and inserts
      const newEntry = action.payload;
      
      // Check for duplicates
      if (isDuplicate(state, newEntry)) {
        return state; // Don't add duplicate
      }
      
      return [...state, newEntry];
    }

    case ACTIONS.UPDATE_ENTRY: {
      // Payload must include id and updatedAt timestamp
      const { id, ...updates } = action.payload;
      
      return state.map(entry =>
        entry.id === id
          ? { ...entry, ...updates }
          : entry
      );
    }

    case ACTIONS.DELETE_ENTRY:
      return state.filter(entry => entry.id !== action.payload);

    default:
      return state;
  }
}

/**
 * Entry factory - creates complete entry object with ID and timestamps
 * Called OUTSIDE the reducer to maintain purity
 * 
 * @param {Object} data - Data to create entry from
 * @returns {Object} Complete entry with all required fields
 */
export function createEntry(data) {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  
  const now = Date.now();
  
  return {
    id,
    word: data.word || '',
    phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
    partOfSpeech: data.partOfSpeech || (data.meanings?.[0]?.partOfSpeech || ''),
    definition: data.definition || data.definitions?.[0] || '',
    sourceUrl: data.sourceUrl || data.sourceUrls?.[0] || '',
    notes: '',
    learningStatus: LEARNING_STATUS.NEW,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Update entry factory - prepares update payload with new timestamp
 * Called OUTSIDE the reducer to maintain purity
 * 
 * @param {Object} entry - Existing entry
 * @param {Object} updates - Fields to update
 * @returns {Object} Complete update payload with updatedAt
 */
export function prepareUpdate(entry, updates) {
  return {
    id: entry.id,
    ...updates,
    updatedAt: Date.now()
  };
}

export default lexiconReducer;
