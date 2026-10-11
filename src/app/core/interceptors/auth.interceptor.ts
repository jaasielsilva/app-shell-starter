import { HttpInterceptorFn } from '@angular/common/http';
import { tokenStorage } from '../auth/token.storage';
import { shellConfig } from '../config/shell.config';

/** Anexa o JWT apenas em chamadas para a API configurada. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = tokenStorage.get();
  if (!token || !req.url.startsWith(shellConfig.api.baseUrl)) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
