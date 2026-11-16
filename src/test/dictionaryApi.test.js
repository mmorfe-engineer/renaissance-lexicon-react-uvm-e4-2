/**
 * Tests for dictionaryApi service
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchDictionary } from '../services/dictionaryApi';

describe('dictionaryApi', () => {
  describe('fetchDictionary', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should return error for empty word', async () => {
      const result = await fetchDictionary('', new AbortController().signal);
      expect(result.error).toBe('Invalid word');
    });

    it('should return error for null word', async () => {
      const result = await fetchDictionary(null, new AbortController().signal);
      expect(result.error).toBe('Invalid word');
    });

    it('should return error for whitespace-only word', async () => {
      const result = await fetchDictionary('   ', new AbortController().signal);
      expect(result.error).toBe('Empty word');
    });

    it('should call fetch with correct URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ word: 'house' }])
      });
      global.fetch = mockFetch;

      await fetchDictionary('house', new AbortController().signal);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/en/house',
        expect.any(Object)
      );
    });

    it('should encode special characters in word', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });
      global.fetch = mockFetch;

      await fetchDictionary('café', new AbortController().signal);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/en/caf%C3%A9',
        expect.any(Object)
      );
    });

    it('should handle 404 response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await fetchDictionary('nonexistentword', new AbortController().signal);
      expect(result.error).toBe('Word not found');
      expect(result.status).toBe(404);
    });

    it('should handle other HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const result = await fetchDictionary('errorword', new AbortController().signal);
      expect(result.error).toContain('HTTP error!');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchDictionary('house', new AbortController().signal);
      expect(result.error).toBe('Network error');
    });

    it('should handle AbortError', async () => {
      const controller = new AbortController();
      
      global.fetch = vi.fn().mockImplementation(() => {
        controller.abort();
        return Promise.reject(new Error('Aborted'));
      });

      // Create a mock AbortError
      const abortError = new Error('Request cancelled');
      abortError.name = 'AbortError';
      global.fetch = vi.fn().mockRejectedValue(abortError);

      const result = await fetchDictionary('house', controller.signal);
      expect(result.error).toBe('Request cancelled');
    });

    it('should normalize response with meanings', async () => {
      const mockData = [{
        word: 'house',
        phonetic: '/haʊs/',
        meanings: [{
          partOfSpeech: 'noun',
          definitions: [{
            definition: 'A building for human habitation',
            example: 'I live in a house.',
            synonyms: ['home', 'residence']
          }]
        }],
        sourceUrls: ['https://api.dictionaryapi.dev'],
        license: { name: 'CC BY-SA 4.0' }
      }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await fetchDictionary('house', new AbortController().signal);

      expect(result.word).toBe('house');
      expect(result.phonetic).toBe('/haʊs/');
      expect(result.partOfSpeech).toBe('noun');
      expect(result.definitions[0]).toBe('A building for human habitation');
      expect(result.examples[0]).toBe('I live in a house.');
      expect(result.synonyms).toContain('home');
      expect(result.sourceUrls[0]).toBe('https://api.dictionaryapi.dev');
    });

    it('should handle empty array response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await fetchDictionary('house', new AbortController().signal);
      expect(result.error).toBe('No results found');
    });
  });
});
