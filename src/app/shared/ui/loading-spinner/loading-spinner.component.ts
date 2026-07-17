import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule, MatProgressBarModule],
  template: `
    @if (overlay) {
      <div class="overlay" [class.overlay--opaque]="opaque" role="status" aria-live="polite">
        <div class="overlay-inner">
          <mat-spinner [diameter]="size === 'lg' ? 56 : size === 'sm' ? 24 : 40"
                       [color]="color"></mat-spinner>
          @if (message) {
            <p class="overlay-message">{{ message }}</p>
          }
        </div>
      </div>
    } @else if (mode === 'bar') {
      <div class="bar-wrap" role="status" aria-live="polite">
        <mat-progress-bar mode="indeterminate" [color]="color"></mat-progress-bar>
        @if (message) { <p class="bar-message">{{ message }}</p> }
      </div>
    } @else {
      <div class="inline-wrap" [class.inline-wrap--center]="centered" role="status" aria-live="polite">
        <mat-spinner [diameter]="size === 'lg' ? 56 : size === 'sm' ? 24 : 40"
                     [color]="color"></mat-spinner>
        @if (message) {
          <p class="inline-message">{{ message }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(2px);
    }

    .overlay--opaque { background: var(--clr-surface); }

    .overlay-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .overlay-message, .inline-message {
      margin: 0;
      font-size: 0.875rem;
      color: var(--clr-text-2);
    }

    .bar-wrap { width: 100%; }
    .bar-message { margin: 0.5rem 0 0; font-size: 0.8rem; color: var(--clr-text-2); }

    .inline-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .inline-wrap--center {
      justify-content: center;
      padding: 2rem;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() mode: 'spinner' | 'bar' = 'spinner';
  @Input() overlay = false;
  @Input() opaque = false;
  @Input() centered = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message = '';
}

