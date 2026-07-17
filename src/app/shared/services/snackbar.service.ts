import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

type SnackTone = 'success' | 'error' | 'info' | 'warning';

const DEFAULT_DURATION_MS = 4000;
const ICON_MAP: Record<SnackTone, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 5000): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'info', durationMs);
  }

  warning(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'warning', durationMs);
  }

  private show(message: string, tone: SnackTone, durationMs: number): void {
    const icon = ICON_MAP[tone];
    const config: MatSnackBarConfig = {
      duration: durationMs,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [`snack-${tone}`],
    };

    this.snackBar.open(`${icon}  ${message}`, '×', config);
  }
}

