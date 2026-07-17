import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

function Consumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Cliente cadastrado com sucesso')}>disparar sucesso</button>
      <button onClick={() => toast.error('Não foi possível salvar')}>disparar erro</button>
      <button onClick={() => toast.info('Aviso qualquer')}>disparar info</button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('exibe um toast de sucesso com a mensagem e a variante corretas', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('disparar sucesso'));

    const toast = screen.getByText('Cliente cadastrado com sucesso').closest('.toast');
    expect(toast).toHaveClass('toast-success');
  });

  it('exibe um toast de erro com a variante correta', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('disparar erro'));

    const toast = screen.getByText('Não foi possível salvar').closest('.toast');
    expect(toast).toHaveClass('toast-error');
  });

  it('empilha múltiplos toasts simultaneamente', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('disparar sucesso'));
    await user.click(screen.getByText('disparar erro'));
    await user.click(screen.getByText('disparar info'));

    expect(screen.getByText('Cliente cadastrado com sucesso')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível salvar')).toBeInTheDocument();
    expect(screen.getByText('Aviso qualquer')).toBeInTheDocument();
  });

  it('fecha o toast ao clicar no botão de fechar', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    await user.click(screen.getByText('disparar sucesso'));
    expect(screen.getByText('Cliente cadastrado com sucesso')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Fechar'));
    expect(screen.queryByText('Cliente cadastrado com sucesso')).not.toBeInTheDocument();
  });

  it('useToast lança erro quando usado fora do ToastProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('useToast deve ser usado dentro de ToastProvider');
    consoleSpy.mockRestore();
  });
});
