import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

export type KpiTone = 'default' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card kpi" [class]="'card kpi tone-' + tone()">
      <div class="kpi-head">
        <span>{{ label() }}</span>
        <span class="kpi-icon"><app-icon [name]="icon()" [size]="16" /></span>
      </div>
      <div class="kpi-value">{{ value() }}</div>
      @if (hint() || trend()) {
        <div class="kpi-foot">
          @if (trend()) {
            <span class="kpi-trend">{{ trend() }}</span>
          }
          @if (hint()) {
            <span>{{ hint() }}</span>
          }
        </div>
      }
    </article>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<IconName>('activity');
  readonly hint = input<string>('');
  readonly trend = input<string>('');
  readonly tone = input<KpiTone>('default');
}
