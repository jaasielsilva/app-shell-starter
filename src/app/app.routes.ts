import { Routes } from '@angular/router';
import { guestGuard, authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

/**
 * Rotas. /login fica FORA do shell (sem sidebar); tudo que exige login é filho do AppShellComponent.
 * Para criar uma tela nova: 1) adicione uma rota filha abaixo; 2) adicione o item em core/navigation/nav.config.ts.
 * Restrição por perfil:  { path: 'x', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: ... }
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
