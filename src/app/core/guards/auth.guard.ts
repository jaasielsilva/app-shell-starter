import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Role } from '../models/user.model';
import { TenantContextService } from '../services/tenant-context.service';

/** Exige usuário autenticado; senão envia ao /login guardando a rota de origem. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(TenantContextService).user()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Impede usuário já logado de ver a tela de login. */
export const guestGuard: CanActivateFn = () => {
  if (!inject(TenantContextService).user()) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};

/**
 * Restringe por perfil. Uso na rota:
 *   { path: 'configuracoes', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, ... }
 */
export const roleGuard: CanActivateFn = (route) => {
  const roles = route.data['roles'] as Role[] | undefined;
  const role = inject(TenantContextService).role();
  if (!roles || (role !== null && roles.includes(role))) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
