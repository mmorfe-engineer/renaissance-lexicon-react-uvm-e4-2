/**
 * EntryEditor component
 * Accessible modal/form for editing lexicon entries.
 */
import { useState, useEffect, useRef } from 'react';
import { LEARNING_STATUS } from '../reducers/lexiconReducer';
import { validateNotes } from '../utils/validation';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'input:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function EntryEditor({ entry, onSave, onCancel }) {
  const [notes, setNotes] = useState(entry?.notes || '');
  const [learningStatus, setLearningStatus] = useState(
    entry?.learningStatus || LEARNING_STATUS.NEW
  );
  const [error, setError] = useState(null);

  const dialogRef = useRef(null);
  const notesRef = useRef(null);
  const initialNotesRef = useRef(entry?.notes || '');
  const initialStatusRef = useRef(
    entry?.learningStatus || LEARNING_STATUS.NEW
  );

  useEffect(() => {
    if (!entry) return;

    setNotes(entry.notes || '');
    setLearningStatus(entry.learningStatus || LEARNING_STATUS.NEW);
    initialNotesRef.current = entry.notes || '';
    initialStatusRef.current =
      entry.learningStatus || LEARNING_STATUS.NEW;
    setError(null);
  }, [entry]);

  useEffect(() => {
    notesRef.current?.focus();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const validation = validateNotes(notes);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    onSave?.({
      ...entry,
      notes,
      learningStatus
    });
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const hasChanges =
    notes !== initialNotesRef.current ||
    learningStatus !== initialStatusRef.current;

  return (
    <div className="editor-overlay">
      <div
        ref={dialogRef}
        className="editor-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-heading"
        aria-describedby="editor-description"
        onKeyDown={handleDialogKeyDown}
      >
        <form onSubmit={handleSubmit} className="editor-form">
          <h2 id="editor-heading" className="editor-title">
            Editar: {entry?.word}
          </h2>

          <p id="editor-description" className="editor-description">
            Actualiza tu nota personal o el estado de aprendizaje. Pulsa Escape
            para cancelar.
          </p>

          <div className="form-field">
            <label htmlFor="entry-notes">Notas personales</label>
            <textarea
              ref={notesRef}
              id="entry-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Agrega tus notas sobre esta palabra..."
              rows={4}
            />
            <small>Opcional</small>
          </div>

          <div className="form-field">
            <label htmlFor="entry-status">Estado de aprendizaje</label>
            <select
              id="entry-status"
              value={learningStatus}
              onChange={(event) => setLearningStatus(event.target.value)}
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
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="save-button" disabled={!hasChanges}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EntryEditor;
