/**
 * Tests for useDictionary hook
 * Focus on validation integration with debounce
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDictionary, SEARCH_STATUS } from '../hooks/useDictionary';
import { validateWord } from '../utils/validation';

// Mock fetchDictionary to track calls
vi.mock('../services/dictionaryApi', () => ({
  fetchDictionary: vi.fn()
}));

// Mock useDebounce to control timing
vi.mock('../hooks/useDebounce', () => ({
  useDebounce: (value, delay) => value // For testing, no debounce
}));

import { fetchDictionary } from '../services/dictionaryApi';

describe('useDictionary hook - Validation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDictionary.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useDictionary).toBeDefined();
  });

  describe('Validation on search', () => {
    it('should NOT fetch for invalid query (1 character)', async () => {
      const { result } = renderHook(() => useDictionary(0));
      
      act(() => {
        result.current.setQuery('a');
      });

      // Wait for any effects
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.ERROR);
      expect(result.current.error).toContain('at least 2 characters');
    });

    it('should NOT fetch for empty query', async () => {
      const { result } = renderHook(() => useDictionary(0));
      
      act(() => {
        result.current.setQuery('');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.IDLE);
    });

    it('should NOT fetch for query with invalid characters', async () => {
      const { result } = renderHook(() => useDictionary(0));
      
      act(() => {
        result.current.setQuery('house@');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.ERROR);
      expect(result.current.error).toContain('invalid characters');
    });

    it('should fetch for valid query (2+ characters)', async () => {
      fetchDictionary.mockResolvedValue({ word: 'house', phonetic: '/haʊs/' });
      
      const { result } = renderHook(() => useDictionary(0));
      
      act(() => {
        result.current.setQuery('house');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(fetchDictionary).toHaveBeenCalledWith('house', expect.anything());
      expect(result.current.status).toBe(SEARCH_STATUS.SUCCESS);
    });

    it('should NOT fetch via debounce for invalid query', async () => {
      const { result } = renderHook(() => useDictionary(450));
      
      act(() => {
        result.current.setQuery('x');
      });

      // Even with debounce, invalid query should not reach fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.ERROR);
    });

    it('should fetch via debounce for valid query', async () => {
      fetchDictionary.mockResolvedValue({ word: 'house' });
      
      const { result } = renderHook(() => useDictionary(450));
      
      act(() => {
        result.current.setQuery('house');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });

      expect(fetchDictionary).toHaveBeenCalledWith('house', expect.anything());
      expect(result.current.status).toBe(SEARCH_STATUS.SUCCESS);
    });
  });

  describe('Direct search call', () => {
    it('should validate when search() called directly', async () => {
      const { result } = renderHook(() => useDictionary(0));
      
      await act(async () => {
        await result.current.search('a');
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.ERROR);
    });

    it('should validate when handleSubmit() called with invalid query', async () => {
      const { result } = renderHook(() => useDictionary(0));
      
      act(() => {
        result.current.setQuery('!');
        result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(fetchDictionary).not.toHaveBeenCalled();
      expect(result.current.status).toBe(SEARCH_STATUS.ERROR);
    });
  });

  describe('Validation function behavior', () => {
    it('validateWord rejects 1 character', () => {
      const result = validateWord('a');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    it('validateWord accepts 2+ characters', () => {
      const result = validateWord('house');
      expect(result.isValid).toBe(true);
    });

    it('validateWord accepts valid word with numbers', () => {
      const result = validateWord('COVID19');
      expect(result.isValid).toBe(true);
    });

    it('validateWord rejects special characters', () => {
      const result = validateWord('house@');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });
  });
});
