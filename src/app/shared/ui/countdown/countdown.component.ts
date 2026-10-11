import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';

/**
 * Contador regressivo HH:MM:SS em tempo real até uma data-alvo.
 * Útil para acessos temporários (JIT), sessões, SLAs. Emite `expired` ao chegar em zero.
 *   <app-countdown [until]="elevation.expiresAt" (expired)="reload()" />
 */
@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="countdown" [class.urgent]="urgent()" [class.expired]="remainingMs() === 0">{{ label() }}</span>`,
})
export class CountdownComponent {
  readonly until = input.required<Date | string | number>();
  /** Abaixo deste limite (segundos) o contador fica vermelho. */
  readonly urgentBelowSeconds = input(60);
  readonly expired = output<void>();

  protected readonly remainingMs = signal(0);
  private fired = false;

  protected readonly urgent = computed(
    () => this.remainingMs() > 0 && this.remainingMs() <= this.urgentBelowSeconds() * 1000,
  );

  protected readonly label = computed(() => {
    const total = Math.floor(this.remainingMs() / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  });

  constructor() {
    effect(() => {
      this.until(); // reinicia quando a data-alvo mudar
      this.fired = false;
      this.tick();
    });

    const id = setInterval(() => this.tick(), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  private tick(): void {
    const ms = Math.max(0, new Date(this.until()).getTime() - Date.now());
    this.remainingMs.set(ms);
    if (ms === 0 && !this.fired) {
      this.fired = true;
      this.expired.emit();
    }
  }
}
