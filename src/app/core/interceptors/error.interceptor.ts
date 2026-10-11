import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { tokenStorage } from '../auth/token.storage';
import { TenantContextService } from '../services/tenant-context.service';
import { ToastService } from '../services/toast.service';

/** Tratamento global: 401 encerra a sessão; falhas de rede/5xx viram toast. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const context = inject(TenantContextService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isLogin = req.url.endsWith('/auth/login');

        if (error.status === 401 && !isLogin) {
          tokenStorage.clear();
          context.clear();
          toast.error('Sua sessão expirou. Entre novamente.');
          void router.navigate(['/login']);
        } else if (error.status === 0 || error.status >= 500) {
          toast.error('Não foi possível comunicar com o servidor.');
        }
      }
      return throwError(() => error);
    }),
  );
};
