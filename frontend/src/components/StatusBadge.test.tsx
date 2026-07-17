import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ATIVO', 'Ativo', 'badge-ativo'],
    ['VENCIDO', 'Vencido', 'badge-vencido'],
    ['ENCERRADO', 'Encerrado', 'badge-encerrado'],
  ] as const)('renderiza %s com label e classe corretas', (status, label, className) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge', className);
  });
});
