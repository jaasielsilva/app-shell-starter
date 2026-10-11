import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-not-found',
  imports: [EmptyStateComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-empty-state title="Página não encontrada" description="O endereço acessado não existe." icon="alert">
      <a class="btn btn-primary" routerLink="/dashboard">Voltar ao dashboard</a>
    </app-empty-state>
  `,
})
export class NotFoundComponent {}
