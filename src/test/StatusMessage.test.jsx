import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StatusMessage from '../components/StatusMessage';

describe('StatusMessage accessibility', () => {
  it('uses polite status semantics for success feedback', () => {
    render(
      <StatusMessage
        message="house actualizada"
        type="success"
        duration={0}
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('uses assertive alert semantics for errors', () => {
    render(
      <StatusMessage
        message="No se pudo guardar"
        type="error"
        duration={0}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('keeps the dismiss control accessible', () => {
    render(
      <StatusMessage
        message="house eliminada"
        type="success"
        duration={0}
        onDismiss={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Cerrar mensaje' })
    ).toBeInTheDocument();
  });
});
