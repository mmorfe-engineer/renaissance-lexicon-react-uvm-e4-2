/**
 * LexiconCard component
 * Displays a single lexicon entry
 */
import { useState } from 'react';
import { LEARNING_STATUS } from '../reducers/lexiconReducer';

export function LexiconCard({ entry, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
    setConfirmingDelete(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmingDelete(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(entry);
    }
  };

  return (
    <article className="lexicon-card" tabIndex={0}>
      <header className="card-header">
        <h4 className="card-word">{entry.word}</h4>
        {entry.phonetic && (
          <p className="card-phonetic">/{entry.phonetic}/</p>
        )}
        {entry.partOfSpeech && (
          <p className="card-part-of-speech">{entry.partOfSpeech}</p>
        )}
      </header>

      <div className="card-definition">
        {entry.definition}
      </div>

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
          <>
            <button 
              onClick={handleCancelDelete}
              className="edit-button"
              aria-label={`Cancelar eliminaci\u00f3n de ${entry.word}`}
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmDelete}
              className="delete-button delete-confirm"
              aria-label={`Eliminar definitivamente ${entry.word}`}
            >
              Eliminar definitivamente
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleEdit}
              className="edit-button"
              aria-label={`Editar ${entry.word}`}
            >
              Editar
            </button>
            <button 
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
