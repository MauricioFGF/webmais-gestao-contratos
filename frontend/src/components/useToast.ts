import { createContext, useContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return ctx;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { message?: string; issues?: Record<string, string[]> } } })
    .response;
  if (!response) return fallback;
  const { message, issues } = response.data ?? {};
  if (issues) {
    const first = Object.values(issues).flat()[0];
    if (first) return first;
  }
  return message ?? fallback;
}
