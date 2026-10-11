import { shellConfig } from '../config/shell.config';

const KEY = `${shellConfig.storagePrefix}.token`;

/**
 * Armazena o JWT em localStorage (simples para começar).
 * Para produção com dados sensíveis, prefira cookie HttpOnly emitido pelo backend.
 */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* storage indisponível */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage indisponível */
    }
  },
};
