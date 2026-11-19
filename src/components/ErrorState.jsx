/**
 * ErrorState component
 * Shows error state with retry option, ported from 4.1
 */

export function ErrorState({ kind, message, onRetry }) {
  const title = kind === 'not-found' ? 'Una palabra por descubrir.' : 'No pudimos completar la búsqueda.';

  return (
    <section className="state-message" aria-labelledby="error-heading">
      <h2 id="error-heading">{title}</h2>
      <p>{message}</p>
      {kind !== 'not-found' && onRetry && (
        <button
          type="button"
          className="word-link"
          onClick={onRetry}
          aria-label="Volver a intentar"
        >
          Volver a intentar
        </button>
      )}
    </section>
  );
}

export default ErrorState;
