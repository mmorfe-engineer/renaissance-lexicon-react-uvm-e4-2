/**
 * Dictionary API Service
 * API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Normalize a single word entry from Dictionary API
 * @param {Object} entry - Raw API entry
 * @returns {Object} Normalized entry
 */
function normalizeEntry(entry) {
  const word = entry.word || '';
  
  // Extract phonetics
  const phonetic = entry.phonetic || '';
  const phonetics = entry.phonetics?.map(p => ({
    text: p.text || '',
    audio: p.audio ? (p.audio.startsWith('http') ? p.audio : `https:${p.audio}`) : null
  }))?.filter(p => p.text || p.audio) || [];

  // Extract meanings
  const meanings = entry.meanings?.map(meaning => ({
    partOfSpeech: meaning.partOfSpeech || '',
    definitions: meaning.definitions?.map(def => ({
      definition: def.definition || '',
      example: def.example || null,
      synonyms: def.synonyms || [],
      antonyms: def.antonyms || []
    }))?.filter(d => d.definition) || [],
    synonyms: meaning.synonyms || [],
    antonyms: meaning.antonyms || []
  }))?.filter(m => m.partOfSpeech && m.definitions.length > 0) || [];

  // Extract source URLs
  const sourceUrls = entry.sourceUrls?.filter(url => url && url.startsWith('https://')) || [];
  const license = entry.license?.name || entry.license?.url || '';

  return {
    word,
    phonetic: phonetic || (phonetics.length > 0 ? phonetics[0].text : ''),
    phonetics,
    meanings,
    sourceUrls,
    license
  };
}

/**
 * Normalize API response
 * @param {Array} data - Raw API response
 * @returns {Object} Normalized data
 */
function normalizeResponse(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { word: '', error: 'No results found' };
  }

  const entry = data[0];
  const normalized = normalizeEntry(entry);

  // Extract all unique synonyms from meanings and definitions
  const allSynonyms = [];
  const synonymsSet = new Set();
  
  normalized.meanings.forEach(meaning => {
    if (meaning.synonyms) {
      meaning.synonyms.forEach(syn => {
        if (syn && !synonymsSet.has(syn.toLowerCase())) {
          synonymsSet.add(syn.toLowerCase());
          allSynonyms.push(syn);
        }
      });
    }
    meaning.definitions.forEach(def => {
      if (def.synonyms) {
        def.synonyms.forEach(syn => {
          if (syn && !synonymsSet.has(syn.toLowerCase())) {
            synonymsSet.add(syn.toLowerCase());
            allSynonyms.push(syn);
          }
        });
      }
    });
  });

  // Extract all audio URLs
  const audioUrls = [];
  normalized.phonetics.forEach(p => {
    if (p.audio) {
      audioUrls.push(p.audio);
    }
  });

  return {
    word: normalized.word,
    phonetic: normalized.phonetic,
    phonetics: normalized.phonetics,
    partOfSpeech: normalized.meanings.length > 0 ? normalized.meanings[0].partOfSpeech : '',
    definitions: normalized.meanings.flatMap(m => m.definitions.map(d => d.definition)),
    examples: normalized.meanings.flatMap(m => m.definitions.map(d => d.example)).filter(Boolean),
    synonyms: allSynonyms,
    audioUrls,
    sourceUrls: normalized.sourceUrls,
    license: normalized.license,
    meanings: normalized.meanings
  };
}

/**
 * Fetch word definition from Dictionary API
 * @param {string} word - Word to search
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} Normalized result or error
 */
export async function fetchDictionary(word, signal) {
  if (!word || typeof word !== 'string') {
    return { error: 'Invalid word' };
  }

  const trimmedWord = word.trim().toLowerCase();
  if (trimmedWord.length === 0) {
    return { error: 'Empty word' };
  }

  try {
    const url = `${BASE_URL}/${encodeURIComponent(trimmedWord)}`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Word not found', status: 404 };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return normalizeResponse(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return { error: 'Request cancelled' };
    }
    return { error: error.message || 'Network error' };
  }
}

export default { fetchDictionary };
