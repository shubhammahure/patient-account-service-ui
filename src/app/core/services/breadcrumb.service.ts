import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface Breadcrumb {
  label: string;
  url: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/auth/login': 'Login',
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/admissions': 'Admissions',
  '/transfers': 'Transfers',
  '/mass-upload': 'Mass Upload',
  '/pfe': 'PFE',
  '/path-to-payment': 'Path To Payment',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/error/401': 'Unauthorized',
  '/error/403': 'Forbidden',
  '/error/404': 'Not Found',
  '/error/500': 'Server Error',
};

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  readonly crumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.build());

    this.build();
  }

  private build(): void {
    const url = this.router.url.split('?')[0];
    const label = ROUTE_LABELS[url] ?? (url.startsWith('/path-to-payment/') ? 'Case Details' : undefined);

    if (!label || url === '/dashboard') {
      this.crumbs.set([{ label: 'Dashboard', url: '/dashboard' }]);
      return;
    }

    if (url === '/auth/login') {
      this.crumbs.set([{ label: 'Login', url: '/auth/login' }]);
      return;
    }

    this.crumbs.set([
      { label: 'Dashboard', url: '/dashboard' },
      { label, url },
    ]);
  }
}

