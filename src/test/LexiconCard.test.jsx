import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LexiconCard from '../components/LexiconCard';

const entry = {
  id: 'entry-1',
  word: 'house',
  phonetic: 'haʊs',
  partOfSpeech: 'noun',
  definition: 'A building for human habitation.',
  notes: '',
  learningStatus: 'Nueva'
};

describe('LexiconCard interactions', () => {
  it('requires explicit confirmation before DELETE', () => {
    const onDelete = vi.fn();

    render(
      <LexiconCard
        entry={entry}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar house' })
    );

    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByText('¿Eliminar “house” de Mi Léxico?')
    ).toBeInTheDocument();
  });

  it('cancels DELETE without calling onDelete and restores focus', async () => {
    const onDelete = vi.fn();

    render(
      <LexiconCard
        entry={entry}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar house' })
    );

    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancel).toHaveFocus();

    fireEvent.click(cancel);

    expect(onDelete).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Eliminar house' })
      ).toHaveFocus();
    });
  });

  it('confirms DELETE only on the definitive action', () => {
    const onDelete = vi.fn();

    render(
      <LexiconCard
        entry={entry}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar house' })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar definitivamente' })
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('entry-1');
  });

  it('passes the edit trigger element to the parent', () => {
    const onEdit = vi.fn();

    render(
      <LexiconCard
        entry={entry}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', {
      name: 'Editar house'
    });

    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit.mock.calls[0][0]).toEqual(entry);
    expect(onEdit.mock.calls[0][1]).toBe(editButton);
  });
});
