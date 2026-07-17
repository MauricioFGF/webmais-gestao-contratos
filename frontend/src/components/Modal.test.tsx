import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renderiza o título e o conteúdo', () => {
    render(
      <Modal title="Novo contrato" onClose={vi.fn()}>
        <p>conteúdo do formulário</p>
      </Modal>,
    );

    expect(screen.getByText('Novo contrato')).toBeInTheDocument();
    expect(screen.getByText('conteúdo do formulário')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão de fechar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Novo contrato" onClose={onClose}>
        <p>conteúdo</p>
      </Modal>,
    );

    await user.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onClose ao pressionar Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Novo contrato" onClose={onClose}>
        <p>conteúdo</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onClose ao clicar fora do modal (overlay)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Novo contrato" onClose={onClose}>
        <p>conteúdo</p>
      </Modal>,
    );

    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não chama onClose ao clicar dentro do conteúdo do modal', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Novo contrato" onClose={onClose}>
        <p>conteúdo</p>
      </Modal>,
    );

    await user.click(screen.getByText('conteúdo'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
