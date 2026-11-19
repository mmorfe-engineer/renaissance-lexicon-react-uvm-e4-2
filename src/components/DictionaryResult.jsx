/**
 * DictionaryResult component
 * Displays Dictionary API results with 4.1 visual design
 */
import PronunciationControl from './PronunciationControl';

// Part of speech translations from 4.1
const POS = {
  noun: 'sustantivo',
  verb: 'verbo',
  adjective: 'adjetivo',
  adverb: 'adverbio',
  pronoun: 'pronombre',
  preposition: 'preposición',
  conjunction: 'conjunción',
  interjection: 'interjección',
  exclamation: 'exclamación',
  determiner: 'determinante',
  other: 'otra categoría'
};

export function DictionaryResult({ result, onSave, onSearch }) {
  if (!result || !result.word) {
    return null;
  }

  // Normalize data to match 4.1 structure
  const word = result.word || '';

  // Get all phonetic texts
  const allPhonetics = [];
  if (result.phonetic) allPhonetics.push(result.phonetic);
  if (result.phonetics) {
    result.phonetics.forEach(p => {
      if (p && !allPhonetics.includes(p)) {
        allPhonetics.push(p);
      }
    });
  }

  const meanings = result.meanings || [];
  const sourceUrls = result.sourceUrls || [];
  const license = result.license || null;

  return (
    <div id="results" aria-busy="false">
      {meanings.map((meaning, meaningIndex) => {
        const partOfSpeech = meaning.partOfSpeech || 'other';
        const posLabel = POS[partOfSpeech] || POS.other;
        const partOfSpeechDisplay = `${partOfSpeech} · ${posLabel}`;

        return (
          <article key={meaningIndex} className="entry" aria-labelledby={`entry-${meaningIndex}`}>
            <header className="entry-heading">
              <div>
                <h2 id={`entry-${meaningIndex}`} lang="en">{word}</h2>
                {allPhonetics.length > 0 && (
                  <p className="phonetic" lang={allPhonetics.length > 0 ? 'en' : 'es'}>
                    {allPhonetics.join(' · ')}
                  </p>
                )}
              </div>

              {result.phonetics && result.phonetics.length > 0 && (
                <PronunciationControl
                  word={word}
                  phonetics={result.phonetics}
                  audioUrls={result.audioUrls || []}
                />
              )}
            </header>

            <section className="meaning">
              <h3>
                {partOfSpeechDisplay}
              </h3>
              
              {meaning.definitions && meaning.definitions.length > 0 ? (
                <ol className="definition-list" lang="en">
                  {meaning.definitions.map((def, defIndex) => (
                    <li key={defIndex}>
                      <p>{def.definition}</p>
                      {def.example && (
                        <blockquote>{def.example}</blockquote>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="audio-note">Sin definiciones disponibles en esta categoría.</p>
              )}

              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <div className="synonyms">
                  <span>Sinónimos</span>
                  {meaning.synonyms.map((synonym, synIndex) => (
                    <button
                      key={synIndex}
                      type="button"
                      className="word-link"
                      onClick={() => onSearch(synonym)}
                      lang="en"
                      aria-label={`Buscar ${synonym}`}
                    >
                      {synonym}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </article>
        );
      })}

      {sourceUrls.length > 0 && (
        <section className="source-list">
          <h3>Fuentes de esta entrada</h3>
          <ul>
            {sourceUrls.map((url, index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {license && (
        <section className="source-list">
          <p className="license">
            Licencia de la entrada: {license.name || license}
            {license.url && (
              <> · <a href={license.url} target="_blank" rel="noopener noreferrer">Ver licencia</a></>
            )}
          </p>
        </section>
      )}

      {onSave && (
        <div className="result-actions">
          <button
            onClick={() => onSave(result)}
            className="word-link save-button"
            aria-label={`Guardar ${result.word} en Mi Lexicon`}
          >
            Guardar en Mi Léxico
          </button>
        </div>
      )}
    </div>
  );
}

export default DictionaryResult;
