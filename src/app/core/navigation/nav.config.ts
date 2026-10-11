import type { Role } from '../models/user.model';
import type { IconName } from '../../shared/ui/icon/icon.component';

export interface NavItem {
  label: string;
  /** Rota do Angular Router (deve existir em app.routes.ts, exceto se `disabled`). */
  path: string;
  icon: IconName;
  /** Perfis que enxergam o item. Omitido = todos os perfis autenticados. */
  roles?: Role[];
  /** Item futuro: aparece apagado com a etiqueta "Em breve" e não navega. */
  disabled?: boolean;
  /** Contador exibido à direita (ex.: aprovações pendentes). */
  badge?: number | string;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

/**
 * MENU DA APLICAÇÃO — edite este array ao criar um app novo.
 * Cada tela nova = 1 item aqui + 1 rota em app.routes.ts.
 */
export const NAV: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { label: 'Cadastros', path: '/cadastros', icon: 'users', disabled: true },
      { label: 'Aprovações', path: '/aprovacoes', icon: 'check-square', roles: ['ADMIN', 'OPERADOR'], disabled: true },
      { label: 'Relatórios', path: '/relatorios', icon: 'file-text', disabled: true },
    ],
  },
  {
    label: 'Administração',
    items: [{ label: 'Configurações', path: '/configuracoes', icon: 'settings', roles: ['ADMIN'], disabled: true }],
  },
];

/** Filtra o menu pelo perfil do usuário e remove seções que ficaram vazias. */
export function navForRole(sections: NavSection[], role: Role | null): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || (role !== null && item.roles.includes(role))),
    }))
    .filter((section) => section.items.length > 0);
}
