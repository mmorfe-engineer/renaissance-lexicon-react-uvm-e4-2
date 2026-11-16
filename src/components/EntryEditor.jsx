/**
 * EntryEditor component
 * Modal/form for editing lexicon entries
 */
import { useState, useEffect, useRef } from 'react';
import { LEARNING_STATUS } from '../reducers/lexiconReducer';
import { validateNotes } from '../utils/validation';

export function EntryEditor({ entry, onSave, onCancel }) {
  const [notes, setNotes] = useState(entry?.notes || '');
  const [learningStatus, setLearningStatus] = useState(entry?.learningStatus || LEARNING_STATUS.NEW);
  const [error, setError] = useState(null);
  
  const dialogRef = useRef(null);
  const initialNotesRef = useRef(entry?.notes || '');

  // Reset state when entry changes
  useEffect(() => {
    if (entry) {
      setNotes(entry.notes || '');
      setLearningStatus(entry.learningStatus || LEARNING_STATUS.NEW);
      initialNotesRef.current = entry.notes || '';
      setError(null);
    }
  }, [entry]);

  // Auto-focus the text area
  useEffect(() => {
    // For modal implementations, focus would go here
    // For now, we'll focus the first input
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateNotes(notes);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (onSave) {
      onSave({
        ...entry,
        notes,
        learningStatus,
        updatedAt: Date.now()
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const hasChanges = notes !== initialNotesRef.current || learningStatus !== (entry?.learningStatus || LEARNING_STATUS.NEW);

  return (
    <div className="editor-overlay" role="dialog" aria-labelledby="editor-heading" aria-modal="true">
      <div className="editor-container">
        <form onSubmit={handleSubmit} className="editor-form">
          <h2 id="editor-heading" className="editor-title">
            Editar: {entry?.word}
          </h2>

          <div className="form-field">
            <label htmlFor="entry-notes">
              Notas personales
            </label>
            <textarea
              id="entry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega tus notas sobre esta palabra..."
              rows={4}
              aria-label="Notas personales"
            />
            <small>Opcional</small>
          </div>

          <div className="form-field">
            <label htmlFor="entry-status">
              Estado de aprendizaje
            </label>
            <select
              id="entry-status"
              value={learningStatus}
              onChange={(e) => setLearningStatus(e.target.value)}
              aria-label="Estado de aprendizaje"
            >
              <option value={LEARNING_STATUS.NEW}>Nueva</option>
              <option value={LEARNING_STATUS.LEARNING}>Aprendiendo</option>
              <option value={LEARNING_STATUS.MASTERED}>Dominada</option>
            </select>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button 
              type="button"
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="save-button"
              disabled={!hasChanges}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EntryEditor;
