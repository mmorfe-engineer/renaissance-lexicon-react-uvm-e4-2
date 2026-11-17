import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EntryEditor from '../components/EntryEditor';

const entry = {
  id: 'entry-1',
  word: 'house',
  notes: '',
  learningStatus: 'Nueva'
};

describe('EntryEditor accessibility', () => {
  it('moves focus to notes when opened', () => {
    render(
      <EntryEditor
        entry={entry}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Notas personales')).toHaveFocus();
  });

  it('cancels with Escape', () => {
    const onCancel = vi.fn();

    render(
      <EntryEditor
        entry={entry}
        onSave={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not save when Cancelar is pressed', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <EntryEditor
        entry={entry}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByLabelText('Notas personales'), {
      target: { value: 'Nueva nota' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves controlled notes and learning status', () => {
    const onSave = vi.fn();

    render(
      <EntryEditor
        entry={entry}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Notas personales'), {
      target: { value: 'Diferenciar house de home.' }
    });

    fireEvent.change(screen.getByLabelText('Estado de aprendizaje'), {
      target: { value: 'Aprendiendo' }
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Guardar cambios' })
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'entry-1',
        notes: 'Diferenciar house de home.',
        learningStatus: 'Aprendiendo'
      })
    );
  });

  it('exposes an accessible modal dialog', () => {
    render(
      <EntryEditor
        entry={entry}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Editar: house'
    });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'editor-description'
    );
  });
});
