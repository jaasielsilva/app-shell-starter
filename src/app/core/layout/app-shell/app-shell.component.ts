import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastContainerComponent } from '../../../shared/ui/toast/toast-container.component';
import { shellConfig } from '../../config/shell.config';
import { NAV, navForRole } from '../../navigation/nav.config';
import { AuthService } from '../../services/auth.service';
import { TenantContextService } from '../../services/tenant-context.service';

/**
 * Casca da aplicação: sidebar (logo, tenant, menu por perfil, usuário) + topbar mobile
 * + <router-outlet>. Toda rota autenticada é filha deste componente.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly context = inject(TenantContextService);

  protected readonly cfg = shellConfig;
  protected readonly user = this.context.user;
  protected readonly tenant = this.context.tenant;
  protected readonly initials = this.context.initials;
  protected readonly roleLabel = computed(() => {
    const role = this.context.role();
    return role ? shellConfig.roleLabels[role] : '';
  });
  protected readonly sections = computed(() => navForRole(NAV, this.context.role()));
  protected readonly navOpen = signal(false);

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
