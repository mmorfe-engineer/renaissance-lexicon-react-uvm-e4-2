/**
 * InitialState component
 * Shows the initial state with suggestions, ported from 4.1
 */

export function InitialState({ onSuggestionClick }) {
  const suggestions = ['serendipity', 'hello', 'learn'];

  return (
    <section className="empty-state" aria-labelledby="empty-state-heading">
      <span className="empty-glyph" aria-hidden="true">
        Aa
      </span>
      <h2 id="empty-state-heading">Tu próxima palabra está aquí.</h2>
      <p>
        Escribe en el buscador o empieza con una de estas palabras.
      </p>
      <div className="suggestions">
        {suggestions.map((word) => (
          <button
            key={word}
            type="button"
            className="word-link"
            onClick={() => onSuggestionClick(word)}
            lang="en"
            aria-label={`Buscar ${word}`}
          >
            {word}
          </button>
        ))}
      </div>
    </section>
  );
}

export default InitialState;
