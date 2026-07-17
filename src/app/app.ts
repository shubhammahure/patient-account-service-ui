import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalErrorComponent } from './shared/ui/global-error/global-error.component';
import { AuthStore } from './state/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalErrorComponent],
  template: `
    <app-global-error />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authStore = inject(AuthStore);

  constructor() {
    void this.authStore.hydrateFromToken();
  }
}
