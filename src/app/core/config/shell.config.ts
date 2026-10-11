import type { Role } from '../models/user.model';
import type { IconName } from '../../shared/ui/icon/icon.component';

export interface ShellConfig {
  /** Nome exibido na sidebar, no login e no título da aba. */
  productName: string;
  tagline: string;
  /** Ícone do logo (ver ICONS em shared/ui/icon). */
  logoIcon: IconName;
  /** Tenant padrão exibido quando o usuário logado não traz um. Use '' para ocultar. */
  tenant: string;
  /** Tema definido em styles/tokens.css: 'default' | 'mint' | seus próprios. */
  theme: string;
  /** Prefixo das chaves de localStorage (evita colisão entre apps em localhost). */
  storagePrefix: string;
  footerEnabled: boolean;
  footerText: string;
  api: {
    /** Base da API Spring Boot. Em dev use proxy (proxy.conf.json) para evitar CORS. */
    baseUrl: string;
    /** true = login/me simulados no front, sem backend. Troque para false ao integrar. */
    useMock: boolean;
  };
  roleLabels: Record<Role, string>;
}

export const shellConfig: ShellConfig = {
  productName: 'App Shell', // gen:productName
  tagline: 'Casca base para novas aplicações', // gen:tagline
  logoIcon: 'shield',
  tenant: 'demo', // gen:tenant
  theme: 'default', // gen:theme
  storagePrefix: 'app-shell', // gen:storagePrefix
  footerEnabled: true,
  footerText: 'App Shell Starter', // gen:footerText
  api: {
    baseUrl: '/api',
    useMock: true,
  },
  roleLabels: {
    ADMIN: 'Admin do Tenant',
    OPERADOR: 'Operador',
    VISUALIZADOR: 'Visualizador',
  },
};
