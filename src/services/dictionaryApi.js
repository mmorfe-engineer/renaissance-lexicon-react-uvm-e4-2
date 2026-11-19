/**
 * Dictionary API Service
 * API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 * Normalization ported from 4.1 with test compatibility
 */

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Safe URL checker - only allow HTTPS URLs
 * Preserves original URL format
 */
function safeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (url.protocol !== 'https:') return '';
    // Return the original if it's already a valid https URL
    // Otherwise return the normalized href
    if (value.startsWith('https://') || value.startsWith('//')) {
      return value.startsWith('//') ? `https:${value}` : value;
    }
    return url.href;
  } catch {
    return '';
  }
}

/**
 * Extract unique strings from array
 * Ported from 4.1 api.js
 */
function strings(values) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  return values
    .map(v => typeof v === 'string' ? v.trim() : '')
    .filter(Boolean)
    .filter(v => {
      const lower = v.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

/**
 * Safe array accessor
 */
function array(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Safe text accessor
 */
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Normalize a single word entry from Dictionary API
 * Ported from 4.1 api.js normalizeEntries
 */
function normalizeEntry(entry) {
  const word = text(entry.word);
  if (!word) return null;

  const phonetic = text(entry.phonetic);
  
  // Extract phonetics with audio
  const rawPhonetics = array(entry.phonetics).filter(Boolean);
  const seenAudio = new Set();
  const pronunciations = rawPhonetics.flatMap(item => {
    const url = safeUrl(item.audio);
    if (!url || seenAudio.has(url)) return [];
    seenAudio.add(url);
    return [{
      url,
      text: text(item.text),
      sourceUrl: safeUrl(item.sourceUrl),
      license: item.license && text(item.license.name)
        ? { name: text(item.license.name), url: safeUrl(item.license.url) }
        : null
    }];
  });

  // Extract phonetic texts
  const phoneticTexts = strings([phonetic, ...rawPhonetics.map(item => text(item.text))]);

  // Extract meanings
  const meanings = array(entry.meanings).filter(Boolean).map(meaning => {
    const partOfSpeech = text(meaning.partOfSpeech) || 'other';

    const definitions = array(meaning.definitions).filter(item => item && text(item.definition)).map(item => ({
      definition: text(item.definition),
      example: text(item.example) || null,
      synonyms: strings(item.synonyms),
      antonyms: strings(item.antonyms)
    }));

    // Collect all synonyms
    const synonyms = strings([
      ...array(meaning.synonyms),
      ...definitions.flatMap(item => item.synonyms)
    ]);

    return {
      partOfSpeech,
      definitions,
      synonyms,
      antonyms: strings(array(meaning.antonyms))
    };
  }).filter(m => m.partOfSpeech && m.definitions.length > 0);

  // Extract source URLs - preserve original format
  const sourceUrls = array(entry.sourceUrls).map(safeUrl).filter(Boolean);
  const license = entry.license && text(entry.license.name)
    ? { name: text(entry.license.name), url: safeUrl(entry.license.url) }
    : null;

  return {
    word,
    phonetic: phoneticTexts[0] || '',
    phonetics: phoneticTexts,
    pronunciations,
    audio: pronunciations[0]?.url || '',
    meanings,
    sourceUrls,
    license
  };
}

/**
 * Normalize API response to match expected test format
 */
function normalizeResponse(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { error: 'No results found' };
  }

  const entry = data[0];
  const normalized = normalizeEntry(entry);

  if (!normalized) {
    return { error: 'No valid entry found' };
  }

  // Extract all audio URLs for PronunciationControl
  const audioUrls = normalized.pronunciations.map(p => p.url);

  // For test compatibility: flatten definitions and examples
  const definitions = [];
  const examples = [];
  const synonyms = [];

  normalized.meanings.forEach(meaning => {
    meaning.definitions.forEach(def => {
      definitions.push(def.definition);
      if (def.example) examples.push(def.example);
    });
    meaning.synonyms.forEach(syn => synonyms.push(syn));
  });

  return {
    word: normalized.word,
    phonetic: normalized.phonetic,
    phonetics: normalized.phonetics,
    partOfSpeech: normalized.meanings.length > 0 ? normalized.meanings[0].partOfSpeech : '',
    definitions,
    examples,
    synonyms,
    audioUrls,
    sourceUrls: normalized.sourceUrls,
    license: normalized.license,
    meanings: normalized.meanings,
    pronunciations: normalized.pronunciations
  };
}

/**
 * Fetch word definition from Dictionary API
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
      if (response.status === 429) {
        return { error: 'El diccionario recibi\u00f3 demasiadas consultas. Espera un momento y vuelve a intentar.', status: 429 };
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
