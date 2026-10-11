import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'accent';

/** <app-status-badge tone="success">Provisionado</app-status-badge> */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="'badge tone-' + tone()"><ng-content /></span>`,
})
export class StatusBadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
}
