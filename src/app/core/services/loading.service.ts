import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly activeRequests = signal(0);

  start(): void {
    this.activeRequests.update((value) => value + 1);
  }

  stop(): void {
    this.activeRequests.update((value) => Math.max(0, value - 1));
  }
}

