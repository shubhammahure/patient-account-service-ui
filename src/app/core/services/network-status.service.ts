import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  readonly isOnline = signal<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly lastChangedAt = signal<Date>(new Date());

  readonly statusLabel = computed(() => (this.isOnline() ? 'Online' : 'Offline'));

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  private updateStatus(isOnline: boolean): void {
    this.isOnline.set(isOnline);
    this.lastChangedAt.set(new Date());
  }
}

