import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
} from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  mono?: boolean;
  align?: 'left' | 'right';
}

/**
 * Template de célula customizada:
 *   <ng-template appCell="status" let-row> <app-status-badge>{{ row.status }}</app-status-badge> </ng-template>
 */
@Directive({ selector: 'ng-template[appCell]' })
export class CellDefDirective {
  readonly key = input.required<string>({ alias: 'appCell' });
  readonly template = inject(TemplateRef<unknown>);
}

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th [class.align-right]="col.align === 'right'">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr>
              @for (col of columns(); track col.key) {
                <td [class.mono]="col.mono" [class.align-right]="col.align === 'right'">
                  @if (templates().get(col.key); as tpl) {
                    <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row }" />
                  } @else {
                    {{ row[col.key] }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length" class="muted">{{ emptyText() }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly emptyText = input('Nenhum registro encontrado.');

  private readonly cellDefs = contentChildren(CellDefDirective);
  protected readonly templates = computed(
    () => new Map(this.cellDefs().map((def) => [def.key(), def.template] as const)),
  );
}
