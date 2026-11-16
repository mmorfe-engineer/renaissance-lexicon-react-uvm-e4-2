/**
 * DictionaryResult component
 * Displays Dictionary API results
 */
import { useState } from 'react';
import PronunciationControl from './PronunciationControl';

export function DictionaryResult({ result, onSave }) {
  const [showFull, setShowFull] = useState(false);

  if (!result || !result.word) {
    return null;
  }

  const hasMultipleMeanings = result.meanings && result.meanings.length > 1;
  const hasExamples = result.examples && result.examples.length > 0;
  const hasSynonyms = result.synonyms && result.synonyms.length > 0;

  const meaningsToShow = showFull ? result.meanings : result.meanings?.slice(0, 1);

  return (
    <section className="dictionary-result" aria-labelledby="result-heading">
      <h2 id="result-heading" className="result-word">
        {result.word}
      </h2>
      
      {result.phonetic && (
        <p className="result-phonetic">
          {result.phonetic}
        </p>
      )}

      {result.audioUrls && result.audioUrls.length > 0 && (
        <PronunciationControl audioUrls={result.audioUrls} />
      )}

      {result.meanings && result.meanings.length > 0 && (
        <div className="result-meanings">
          {meaningsToShow?.map((meaning, index) => (
            <div key={index} className="meaning">
              {meaning.partOfSpeech && (
                <p className="part-of-speech">{meaning.partOfSpeech}</p>
              )}
              
              {meaning.definitions && meaning.definitions.length > 0 && (
                <ul className="definitions-list">
                  {meaning.definitions.map((def, defIndex) => (
                    <li key={defIndex} className="definition">
                      {def.definition}
                      {def.example && (
                        <span className="example">
                          <br />
                          <em>Ejemplo: {def.example}</em>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <p className="synonyms">
                  <strong>Sinónimos:</strong> {meaning.synonyms.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMultipleMeanings && !showFull && (
        <button 
          onClick={() => setShowFull(true)}
          className="show-more-button"
        >
          Mostrar más definiciones ({result.meanings.length})
        </button>
      )}

      {hasExamples && !showFull && (
        <div className="examples">
          <strong>Ejemplos:</strong>
          <ul>
            {result.examples.slice(0, 2).map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      )}

      {hasSynonyms && !showFull && result.synonyms.length > 0 && (
        <p className="all-synonyms">
          <strong>Sinónimos:</strong> {result.synonyms.join(', ')}
        </p>
      )}

      {result.sourceUrls && result.sourceUrls.length > 0 && (
        <p className="source">
          <small>
            Fuente: <a href={result.sourceUrls[0]} target="_blank" rel="noopener noreferrer">
              Dictionary API
            </a>
          </small>
        </p>
      )}

      <div className="result-actions">
        <button 
          onClick={() => onSave(result)}
          className="save-button"
          aria-label={`Guardar ${result.word} en Mi Léxico`}
        >
          Guardar en Mi Léxico
        </button>
      </div>
    </section>
  );
}

export default DictionaryResult;
