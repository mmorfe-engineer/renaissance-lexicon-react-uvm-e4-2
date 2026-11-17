/**
 * Tests for lexiconReducer
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { lexiconReducer, ACTIONS, LEARNING_STATUS, createEntry } from '../reducers/lexiconReducer';

describe('lexiconReducer', () => {
  let initialState;

  beforeEach(() => {
    initialState = [];
  });

  describe('HYDRATE_ENTRIES', () => {
    it('should load entries from storage', () => {
      const entries = [
        { id: '1', word: 'house', notes: '' },
        { id: '2', word: 'water', notes: '' }
      ];
      const action = { type: ACTIONS.HYDRATE_ENTRIES, payload: entries };
      const result = lexiconReducer(initialState, action);
      expect(result).toEqual(entries);
    });

    it('should handle null payload', () => {
      const action = { type: ACTIONS.HYDRATE_ENTRIES, payload: null };
      const result = lexiconReducer(initialState, action);
      expect(result).toEqual([]);
    });

    it('should handle empty array payload', () => {
      const action = { type: ACTIONS.HYDRATE_ENTRIES, payload: [] };
      const result = lexiconReducer(initialState, action);
      expect(result).toEqual([]);
    });
  });

  describe('CREATE_ENTRY', () => {
    it('should add new entry', () => {
      const entryData = { word: 'house', phonetic: '/haʊs/' };
      const action = { type: ACTIONS.CREATE_ENTRY, payload: entryData };
      const result = lexiconReducer(initialState, action);
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('house');
      expect(result[0].phonetic).toBe('/haʊs/');
    });

    it('should accept pre-created entry with ID and timestamps', () => {
      const entryData = { word: 'house', phonetic: '/haʊs/' };
      const entry = createEntry(entryData);
      const action = { type: ACTIONS.CREATE_ENTRY, payload: entry };
      const result = lexiconReducer(initialState, action);
      expect(result[0].id).toBeDefined();
      expect(typeof result[0].id).toBe('string');
      expect(result[0].learningStatus).toBe(LEARNING_STATUS.NEW);
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
      expect(typeof result[0].createdAt).toBe('number');
      expect(typeof result[0].updatedAt).toBe('number');
    });

    it('should prevent duplicates', () => {
      const entryData = { word: 'house', partOfSpeech: 'noun', definition: 'A building' };
      const action1 = { type: ACTIONS.CREATE_ENTRY, payload: entryData };
      const action2 = { type: ACTIONS.CREATE_ENTRY, payload: entryData };
      
      let state = lexiconReducer(initialState, action1);
      state = lexiconReducer(state, action2);
      
      expect(state.length).toBe(1);
    });

    it('should allow same word with different definitions', () => {
      const entry1 = { word: 'house', partOfSpeech: 'noun', definition: 'A building' };
      const entry2 = { word: 'house', partOfSpeech: 'verb', definition: 'To provide shelter' };
      
      const action1 = { type: ACTIONS.CREATE_ENTRY, payload: entry1 };
      const action2 = { type: ACTIONS.CREATE_ENTRY, payload: entry2 };
      
      let state = lexiconReducer(initialState, action1);
      state = lexiconReducer(state, action2);
      
      expect(state.length).toBe(2);
    });
  });

  describe('UPDATE_ENTRY', () => {
    it('should update entry by ID with pre-prepared timestamp', () => {
      const createdAt = Date.now();
      const entry = { id: '1', word: 'house', notes: '', createdAt };
      initialState = [entry];
      
      // Use a timestamp slightly after createdAt to ensure it's greater
      const updatedAt = createdAt + 1;
      const updates = { id: '1', notes: 'Important word', updatedAt };
      const action = { type: ACTIONS.UPDATE_ENTRY, payload: updates };
      const result = lexiconReducer(initialState, action);
      
      expect(result[0].notes).toBe('Important word');
      expect(result[0].updatedAt).toBe(updates.updatedAt);
      expect(result[0].updatedAt).toBeGreaterThan(entry.createdAt);
    });

    it('should update learningStatus', () => {
      const entry = { id: '1', word: 'house', learningStatus: LEARNING_STATUS.NEW };
      initialState = [entry];
      
      const updates = { id: '1', learningStatus: LEARNING_STATUS.LEARNING };
      const action = { type: ACTIONS.UPDATE_ENTRY, payload: updates };
      const result = lexiconReducer(initialState, action);
      
      expect(result[0].learningStatus).toBe(LEARNING_STATUS.LEARNING);
    });

    it('should not modify other entries', () => {
      const entries = [
        { id: '1', word: 'house' },
        { id: '2', word: 'water' }
      ];
      initialState = entries;
      
      const updates = { id: '1', notes: 'Updated' };
      const action = { type: ACTIONS.UPDATE_ENTRY, payload: updates };
      const result = lexiconReducer(initialState, action);
      
      expect(result[0].notes).toBe('Updated');
      expect(result[1].notes).toBeUndefined();
    });

    it('should do nothing if ID not found', () => {
      const entry = { id: '1', word: 'house' };
      initialState = [entry];
      
      const updates = { id: '999', notes: 'Not found' };
      const action = { type: ACTIONS.UPDATE_ENTRY, payload: updates };
      const result = lexiconReducer(initialState, action);
      
      expect(result).toEqual(initialState);
    });
  });

  describe('DELETE_ENTRY', () => {
    it('should remove entry by ID', () => {
      const entries = [
        { id: '1', word: 'house' },
        { id: '2', word: 'water' }
      ];
      initialState = entries;
      
      const action = { type: ACTIONS.DELETE_ENTRY, payload: '1' };
      const result = lexiconReducer(initialState, action);
      
      expect(result.length).toBe(1);
      expect(result[0].word).toBe('water');
    });

    it('should do nothing if ID not found', () => {
      const entry = { id: '1', word: 'house' };
      initialState = [entry];
      
      const action = { type: ACTIONS.DELETE_ENTRY, payload: '999' };
      const result = lexiconReducer(initialState, action);
      
      expect(result).toEqual(initialState);
    });

    it('should handle empty state', () => {
      const action = { type: ACTIONS.DELETE_ENTRY, payload: '1' };
      const result = lexiconReducer(initialState, action);
      expect(result).toEqual([]);
    });

    it('should return empty array when deleting last entry', () => {
      const entries = [{ id: '1', word: 'house' }];
      const action = { type: ACTIONS.DELETE_ENTRY, payload: '1' };
      const result = lexiconReducer(entries, action);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('createEntry', () => {
    it('should create entry with all required fields', () => {
      const data = {
        word: 'house',
        phonetic: '/haʊs/',
        partOfSpeech: 'noun',
        definition: 'A building',
        sourceUrl: 'https://example.com'
      };
      const entry = createEntry(data);
      
      expect(entry.id).toBeDefined();
      expect(entry.word).toBe('house');
      expect(entry.phonetic).toBe('/haʊs/');
      expect(entry.partOfSpeech).toBe('noun');
      expect(entry.definition).toBe('A building');
      expect(entry.sourceUrl).toBe('https://example.com');
      expect(entry.notes).toBe('');
      expect(entry.learningStatus).toBe(LEARNING_STATUS.NEW);
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
    });

    it('should handle missing fields', () => {
      const data = { word: 'house' };
      const entry = createEntry(data);
      
      expect(entry.word).toBe('house');
      expect(entry.phonetic).toBe('');
      expect(entry.partOfSpeech).toBe('');
      expect(entry.definition).toBe('');
      expect(entry.sourceUrl).toBe('');
    });
  });
});
