import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthStore } from '../state/auth.store';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <span>Patient Account Portal</span>
      <span class="spacer"></span>
      <span>{{ authStore.username() || 'Guest' }}</span>
      <button mat-button type="button" (click)="authStore.logout()">Logout</button>
    </mat-toolbar>

    @if (loadingService.activeRequests() > 0) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <mat-sidenav-container class="shell-container">
      <mat-sidenav mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a mat-list-item routerLink="/patients" routerLinkActive="active">Patients</a>
          <a mat-list-item routerLink="/admissions" routerLinkActive="active">Admissions</a>
          <a mat-list-item routerLink="/payment-cases" routerLinkActive="active">Path to Payment</a>
          <a mat-list-item routerLink="/pfe-workflow" routerLinkActive="active">PFE Workflow</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <section class="page-wrap">
          <router-outlet />
        </section>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .topbar { position: sticky; top: 0; z-index: 10; }
      .spacer { flex: 1 1 auto; }
      .shell-container { height: calc(100vh - 64px); }
      .page-wrap { padding: 1rem; }
      a.active { background: rgba(0, 0, 0, 0.08); }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);
  readonly loadingService = inject(LoadingService);
}

