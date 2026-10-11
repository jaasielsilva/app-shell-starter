import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MOCK_HINT } from '../../../core/auth/mock-auth';
import { shellConfig } from '../../../core/config/shell.config';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly cfg = shellConfig;
  protected readonly mockHint = shellConfig.api.useMock ? MOCK_HINT : '';
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl(this.redirectTarget()),
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(this.messageFor(err));
      },
    });
  }

  /** Só aceita redirecionamento interno (evita open redirect). */
  private redirectTarget(): string {
    const target = this.route.snapshot.queryParamMap.get('redirect');
    return target && target.startsWith('/') && !target.startsWith('//') ? target : '/dashboard';
  }

  private messageFor(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.status === 401 || err.status === 403
        ? 'E-mail ou senha inválidos'
        : 'Não foi possível entrar. Tente novamente.';
    }
    return err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.';
  }
}
