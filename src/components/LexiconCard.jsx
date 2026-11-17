/**
 * LexiconCard component
 * Displays a single lexicon entry with accessible edit/delete interactions.
 */
import { useEffect, useRef, useState } from 'react';
import { LEARNING_STATUS } from '../reducers/lexiconReducer';

export function LexiconCard({ entry, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteButtonRef = useRef(null);
  const cancelDeleteRef = useRef(null);

  const statusLabels = {
    [LEARNING_STATUS.NEW]: 'Nueva',
    [LEARNING_STATUS.LEARNING]: 'Aprendiendo',
    [LEARNING_STATUS.MASTERED]: 'Dominada'
  };

  const statusClass = {
    [LEARNING_STATUS.NEW]: 'status-new',
    [LEARNING_STATUS.LEARNING]: 'status-learning',
    [LEARNING_STATUS.MASTERED]: 'status-mastered'
  };

  useEffect(() => {
    if (confirmingDelete) cancelDeleteRef.current?.focus();
  }, [confirmingDelete]);

  const handleDelete = (event) => {
    event.stopPropagation();
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = (event) => {
    event.stopPropagation();
    onDelete?.(entry.id);
  };

  const handleCancelDelete = (event) => {
    event.stopPropagation();
    setConfirmingDelete(false);
    requestAnimationFrame(() => deleteButtonRef.current?.focus());
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    onEdit?.(entry, event.currentTarget);
  };

  return (
    <article className="lexicon-card">
      <header className="card-header">
        <h4 className="card-word">{entry.word}</h4>
        {entry.phonetic && <p className="card-phonetic">/{entry.phonetic}/</p>}
        {entry.partOfSpeech && (
          <p className="card-part-of-speech">{entry.partOfSpeech}</p>
        )}
      </header>

      <div className="card-definition">{entry.definition}</div>

      <div className="card-personal">
        <div className="learning-status">
          <span className={`status-badge ${statusClass[entry.learningStatus] || ''}`}>
            {statusLabels[entry.learningStatus] || entry.learningStatus}
          </span>
        </div>

        {entry.notes && entry.notes.trim() !== '' && (
          <div className="card-notes">
            <strong>Nota:</strong> {entry.notes}
          </div>
        )}
      </div>

      <footer className="card-footer">
        {confirmingDelete ? (
          <div
            className="delete-confirmation"
            role="group"
            aria-label={`Confirmar eliminación de ${entry.word}`}
          >
            <p className="delete-confirmation-text">
              ¿Eliminar “{entry.word}” de Mi Léxico?
            </p>
            <div className="delete-confirmation-actions">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={handleCancelDelete}
                className="edit-button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="delete-button delete-confirm"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleEdit}
              className="edit-button"
              aria-label={`Editar ${entry.word}`}
            >
              Editar
            </button>
            <button
              ref={deleteButtonRef}
              type="button"
              onClick={handleDelete}
              className="delete-button"
              aria-label={`Eliminar ${entry.word}`}
            >
              Eliminar
            </button>
          </>
        )}
      </footer>
    </article>
  );
}

export default LexiconCard;
