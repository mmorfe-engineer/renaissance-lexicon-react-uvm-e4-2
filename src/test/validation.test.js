/**
 * Tests for validation utilities
 */
import { describe, it, expect } from 'vitest';
import { validateWord, validateNotes, validateLearningStatus, validateEntry } from '../utils/validation';

describe('validation', () => {
  describe('validateWord', () => {
    it('should accept valid words', () => {
      const result = validateWord('house');
      expect(result.isValid).toBe(true);
    });

    it('should accept words with hyphens', () => {
      const result = validateWord('state-of-the-art');
      expect(result.isValid).toBe(true);
    });

    it('should accept words with apostrophes', () => {
      const result = validateWord("don't");
      expect(result.isValid).toBe(true);
    });

    it('should accept words with spaces', () => {
      const result = validateWord('New York');
      expect(result.isValid).toBe(true);
    });

    it('should accept numbers', () => {
      const result = validateWord('123');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateWord('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word is required');
    });

    it('should reject whitespace-only', () => {
      const result = validateWord('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word cannot be empty');
    });

    it('should reject null', () => {
      const result = validateWord(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word is required');
    });

    it('should reject undefined', () => {
      const result = validateWord(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word is required');
    });

    it('should reject non-string', () => {
      const result = validateWord(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word is required');
    });

    it('should reject words shorter than 2 characters', () => {
      const result = validateWord('a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word must be at least 2 characters');
    });

    it('should reject words with special characters', () => {
      const result = validateWord('word@test');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word contains invalid characters');
    });

    it('should reject words with symbols', () => {
      const result = validateWord('word#test');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Word contains invalid characters');
    });
  });

  describe('validateNotes', () => {
    it('should accept valid notes', () => {
      const result = validateNotes('These are my notes');
      expect(result.isValid).toBe(true);
    });

    it('should accept empty notes', () => {
      const result = validateNotes('');
      expect(result.isValid).toBe(true);
    });

    it('should accept null notes', () => {
      const result = validateNotes(null);
      expect(result.isValid).toBe(true);
    });

    it('should accept undefined notes', () => {
      const result = validateNotes(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should reject notes exceeding 10000 characters', () => {
      const longNotes = 'a'.repeat(10001);
      const result = validateNotes(longNotes);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Notes cannot exceed 10000 characters');
    });

    it('should accept notes at exactly 10000 characters', () => {
      const notes = 'a'.repeat(10000);
      const result = validateNotes(notes);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-string notes', () => {
      const result = validateNotes(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Notes must be a string');
    });
  });

  describe('validateLearningStatus', () => {
    it('should accept Nueva', () => {
      expect(validateLearningStatus('Nueva')).toBe(true);
    });

    it('should accept Aprendiendo', () => {
      expect(validateLearningStatus('Aprendiendo')).toBe(true);
    });

    it('should accept Dominada', () => {
      expect(validateLearningStatus('Dominada')).toBe(true);
    });

    it('should reject invalid status', () => {
      expect(validateLearningStatus('invalid')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateLearningStatus('')).toBe(false);
    });

    it('should reject null', () => {
      expect(validateLearningStatus(null)).toBe(false);
    });
  });

  describe('validateEntry', () => {
    it('should accept valid entry', () => {
      const entry = {
        id: '1',
        word: 'house',
        notes: 'My notes',
        learningStatus: 'Nueva'
      };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(true);
    });

    it('should reject entry without ID', () => {
      const entry = { word: 'house' };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID is required');
    });

    it('should reject entry with invalid word', () => {
      const entry = { id: '1', word: 'a' };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Word must be at least 2 characters');
    });

    it('should reject entry with invalid learningStatus', () => {
      const entry = { id: '1', word: 'house', learningStatus: 'invalid' };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid learning status');
    });

    it('should collect multiple errors', () => {
      const entry = { word: 'a', learningStatus: 'invalid' };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors).toContain('Word must be at least 2 characters');
      expect(result.errors).toContain('Invalid learning status');
    });

    it('should accept entry without optional fields', () => {
      const entry = { id: '1', word: 'house' };
      const result = validateEntry(entry);
      expect(result.isValid).toBe(true);
    });
  });
});
