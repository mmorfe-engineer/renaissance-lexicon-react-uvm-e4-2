/**
 * Validation utilities
 * Compatible with 4.1 validation and existing tests
 */

/**
 * Validate word input
 * @param {string} word - Word to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateWord(word) {
  if (!word || typeof word !== 'string') {
    return { isValid: false, error: 'Word is required' };
  }

  const trimmed = word.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Word cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Word must be at least 2 characters' };
  }

  if (trimmed.length > 80) {
    return { isValid: false, error: 'Word must be at most 80 characters' };
  }

  // Allow letters, numbers, spaces, hyphens, and apostrophes
  // This matches the test expectations and is more permissive than 4.1
  const wordRegex = /^[a-zA-Z0-9\s'-]+$/;
  if (!wordRegex.test(trimmed)) {
    return { isValid: false, error: 'Word contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate notes input
 * @param {string} notes - Notes to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateNotes(notes) {
  if (notes === undefined || notes === null) {
    return { isValid: true, error: '' };
  }

  if (typeof notes !== 'string') {
    return { isValid: false, error: 'Notes must be a string' };
  }

  if (notes.length > 10000) {
    return { isValid: false, error: 'Notes cannot exceed 10000 characters' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validate learning status
 * @param {string} status - Status to validate
 * @returns {boolean}
 */
export function validateLearningStatus(status) {
  if (!status) return false;
  const validStatuses = ['Nueva', 'Aprendiendo', 'Dominada'];
  return validStatuses.includes(status);
}

/**
 * Validate entry data
 * @param {Object} entry - Entry to validate
 * @returns {Object} { isValid: boolean, errors?: Array }
 */
export function validateEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { isValid: false, errors: ['Entry must be an object'] };
  }

  if (!entry.id) {
    errors.push('ID is required');
  }

  if (entry.word !== undefined) {
    if (!entry.word) {
      errors.push('Word is required');
    } else {
      const wordValidation = validateWord(entry.word);
      if (!wordValidation.isValid) {
        errors.push(wordValidation.error);
      }
    }
  }

  if (entry.notes !== undefined && entry.notes !== null) {
    const notesValidation = validateNotes(entry.notes);
    if (!notesValidation.isValid) {
      errors.push(notesValidation.error);
    }
  }

  if (entry.learningStatus !== undefined && !validateLearningStatus(entry.learningStatus)) {
    errors.push('Invalid learning status');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

export default {
  validateWord,
  validateNotes,
  validateLearningStatus,
  validateEntry
};
