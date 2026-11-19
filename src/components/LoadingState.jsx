/**
 * LoadingState component
 * Shows loading state with animated dot, ported from 4.1
 */

export function LoadingState({ word }) {
  return (
    <section className="state-message" aria-busy="true" aria-live="polite">
      <h2>
        <span className="loading-dot" aria-hidden="true"></span>
        Buscando tu palabra …
      </h2>
      <p>Consultando <q>{word}</q> en Dictionary API.</p>
    </section>
  );
}

export default LoadingState;
