import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { mockUserFromToken } from '../auth/mock-auth';
import { tokenStorage } from '../auth/token.storage';
import { shellConfig } from '../config/shell.config';
import type { User } from '../models/user.model';

/**
 * Contexto do usuário/tenant logado. Carregado na inicialização do app
 * (provideAppInitializer em app.config.ts) a partir de GET /auth/me.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly http = inject(HttpClient);
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();
  readonly role = computed(() => this._user()?.role ?? null);
  readonly tenant = computed(() => this._user()?.tenant || shellConfig.tenant);
  readonly initials = computed(() => {
    const name = this._user()?.name ?? '';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?'
    );
  });

  setUser(user: User): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }

  /** Restaura a sessão a partir do token salvo. Nunca lança: token inválido apenas limpa a sessão. */
  async load(): Promise<void> {
    const token = tokenStorage.get();
    if (!token) return;

    try {
      const user = shellConfig.api.useMock
        ? mockUserFromToken(token)
        : await firstValueFrom(this.http.get<User>(`${shellConfig.api.baseUrl}/auth/me`));

      if (user) {
        this._user.set(user);
      } else {
        tokenStorage.clear();
      }
    } catch {
      tokenStorage.clear();
    }
  }
}
