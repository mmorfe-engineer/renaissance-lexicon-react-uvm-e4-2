/**
 * LexiconList component
 * Displays list of saved entries.
 */
import LexiconCard from './LexiconCard';

export function LexiconList({ entries, onEdit, onDelete, headingRef }) {
  if (!entries || entries.length === 0) {
    return (
      <section className="lexicon-list empty" aria-labelledby="empty-lexicon-heading">
        <p className="section-label">
          <span className="small-dot" aria-hidden="true"></span>
          Tus palabras guardadas
        </p>
        <h3 ref={headingRef} id="empty-lexicon-heading" tabIndex="-1">
          Mi Léxico
        </h3>
        <p>Todavía no has guardado palabras.</p>
        <p>Busca una palabra y haz clic en <q>Guardar en Mi Léxico</q>.</p>
      </section>
    );
  }

  return (
    <section className="lexicon-list" aria-labelledby="lexicon-heading">
      <p className="section-label">
        <span className="small-dot" aria-hidden="true"></span>
        Tus palabras guardadas
      </p>
      <h3 ref={headingRef} id="lexicon-heading" tabIndex="-1">
        Mi Léxico ({entries.length})
      </h3>
      <ul className="lexicon-cards">
        {entries.map((entry) => (
          <LexiconCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}

export default LexiconList;
