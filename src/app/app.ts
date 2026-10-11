import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { shellConfig } from './core/config/shell.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // aplica o tema (styles/tokens.css) e o título da aba definidos em shell.config.ts
    document.documentElement.dataset['theme'] = shellConfig.theme;
    document.title = shellConfig.productName;
  }
}
