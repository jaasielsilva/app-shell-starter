import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap, throwError, timer } from 'rxjs';
import { mockAuthenticate } from '../auth/mock-auth';
import { tokenStorage } from '../auth/token.storage';
import { shellConfig } from '../config/shell.config';
import type { User } from '../models/user.model';
import { TenantContextService } from './tenant-context.service';

/**
 * Contrato esperado do backend (Spring Boot):
 *   POST /auth/login  { email, password } -> { token }
 *   GET  /auth/me                         -> { id, name, email, role, tenant }
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly context = inject(TenantContextService);

  login(email: string, password: string): Observable<User> {
    if (shellConfig.api.useMock) {
      return timer(350).pipe(
        map(() => mockAuthenticate(email, password)),
        switchMap((user) => (user ? [user] : throwError(() => new Error('E-mail ou senha inválidos')))),
        tap((user) => {
          tokenStorage.set(`mock.${user.email}`);
          this.context.setUser(user);
        }),
      );
    }

    const base = shellConfig.api.baseUrl;
    return this.http.post<{ token: string }>(`${base}/auth/login`, { email, password }).pipe(
      tap((res) => tokenStorage.set(res.token)),
      switchMap(() => this.http.get<User>(`${base}/auth/me`)),
      tap((user) => this.context.setUser(user)),
    );
  }

  logout(): void {
    tokenStorage.clear();
    this.context.clear();
    void this.router.navigate(['/login']);
  }
}
