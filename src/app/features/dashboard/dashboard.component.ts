import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { shellConfig } from '../../core/config/shell.config';
import { ToastService } from '../../core/services/toast.service';
import { CountdownComponent } from '../../shared/ui/countdown/countdown.component';
import { CellDefDirective, DataTableComponent, TableColumn } from '../../shared/ui/data-table/data-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card/kpi-card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { BadgeTone, StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

interface ActivityRow extends Record<string, unknown> {
  code: string;
  author: string;
  type: 'PADRÃO' | 'ESPECIAL';
  resource: string;
  status: 'Concluído' | 'Em andamento' | 'Expirado';
}

/**
 * Tela de exemplo. Mostra como compor uma página com os componentes de shared/ui.
 * Substitua pelo conteúdo real da aplicação (dados vêm de um service que chama a API).
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    PageHeaderComponent,
    KpiCardComponent,
    DataTableComponent,
    CellDefDirective,
    StatusBadgeComponent,
    CountdownComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly toast = inject(ToastService);

  protected readonly product = shellConfig.productName;

  protected readonly columns: TableColumn[] = [
    { key: 'code', label: 'Código', mono: true },
    { key: 'author', label: 'Responsável' },
    { key: 'type', label: 'Tipo' },
    { key: 'resource', label: 'Recurso' },
    { key: 'status', label: 'Status' },
  ];

  protected readonly rows: ActivityRow[] = [
    { code: 'REG-2026-0142', author: 'Marina Costa', type: 'PADRÃO', resource: 'Módulo de cadastros', status: 'Concluído' },
    { code: 'REG-2026-0143', author: 'Diego Martins', type: 'ESPECIAL', resource: 'Servidor de homologação', status: 'Em andamento' },
    { code: 'REG-2026-0138', author: 'Tatiane Reis', type: 'PADRÃO', resource: 'Relatório mensal', status: 'Expirado' },
  ];

  /** Exemplo para o contador: expira em 1h12min a partir de agora. */
  protected readonly sampleExpiry = new Date(Date.now() + 72 * 60 * 1000);

  protected toneFor(status: ActivityRow['status']): BadgeTone {
    return status === 'Concluído' ? 'success' : status === 'Em andamento' ? 'warning' : 'neutral';
  }

  protected notify(): void {
    this.toast.success('Ação de exemplo executada.');
  }
}
