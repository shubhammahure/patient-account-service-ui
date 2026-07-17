import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthStore } from '../state/auth.store';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { BreadcrumbService } from '../core/services/breadcrumb.service';
import { LoadingService } from '../core/services/loading.service';
import { SIDEBAR_NAV_ITEMS, type AppRole } from '../app.routes';

interface NavSection {
  label: string;
  items: Array<{ label: string; icon: string; route: string }>;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, DatePipe, FormsModule,
    MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule,
    MatDividerModule, MatTooltipModule, MatProgressBarModule,
  ],
  template: `
    @if (isMobile() && mobileOpen()) {
      <div class="backdrop" (click)="mobileOpen.set(false)" role="presentation"></div>
    }

    <div class="shell" [class.sidebar-collapsed]="collapsed() && !isMobile()">

      <!-- SIDEBAR -->
      <aside class="sidebar"
             [class.sidebar--collapsed]="collapsed() && !isMobile()"
             [class.sidebar--mobile-open]="isMobile() && mobileOpen()"
             [class.sidebar--mobile]="isMobile()"
             aria-label="Main navigation">

        <div class="sidebar-logo">
          <span class="logo-icon-wrap"><mat-icon>local_hospital</mat-icon></span>
          @if (!(collapsed() && !isMobile())) {
            <div class="logo-text">
              <span class="logo-name">HealthPortal</span>
              <span class="logo-sub">Patient Account</span>
            </div>
          }
        </div>

        <nav class="sidebar-nav">
          @for (section of navSections(); track section.label) {
            <div class="nav-section">
              @if (!(collapsed() && !isMobile())) {
                <span class="nav-section-label">{{ section.label }}</span>
              }
              @for (item of section.items; track item.route) {
                <a class="nav-item" [routerLink]="item.route" routerLinkActive="nav-item--active"
                   [matTooltip]="collapsed() && !isMobile() ? item.label : ''"
                   matTooltipPosition="right"
                   (click)="isMobile() && mobileOpen.set(false)">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  @if (!(collapsed() && !isMobile())) { <span>{{ item.label }}</span> }
                </a>
              }
            </div>
          }
        </nav>

        @if (!isMobile()) {
          <button class="sidebar-collapse-btn" (click)="collapsed.update(v => !v)"
                  [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        }
      </aside>

      <!-- MAIN AREA -->
      <div class="main-area">

        <header class="app-header" role="banner">
          <div class="header-start">
            @if (isMobile()) {
              <button mat-icon-button aria-label="Open navigation" (click)="mobileOpen.update(v => !v)">
                <mat-icon>menu</mat-icon>
              </button>
            }
            <nav class="breadcrumb" aria-label="Breadcrumb">
              @for (crumb of breadcrumbService.crumbs(); track crumb.url; let last = $last) {
                @if (!last) {
                  <a class="crumb-link" [routerLink]="crumb.url">{{ crumb.label }}</a>
                  <mat-icon class="crumb-sep" aria-hidden="true">chevron_right</mat-icon>
                } @else {
                  <span class="crumb-current" aria-current="page">{{ crumb.label }}</span>
                }
              }
            </nav>
          </div>

          <div class="header-end">
            <div class="header-search" role="search">
              <mat-icon aria-hidden="true">search</mat-icon>
              <input type="search" class="search-input" placeholder="Search patients, cases…"
                     aria-label="Search patients and cases" [(ngModel)]="searchQueryValue"
                     (keydown.enter)="onSearchSubmit()" />
            </div>

            <button mat-icon-button class="header-icon-btn icon-pill"
                    [matTooltip]="themeService.isDarkMode() ? 'Light mode' : 'Dark mode'"
                    (click)="themeService.toggle()" aria-label="Toggle theme">
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <button mat-icon-button class="header-icon-btn icon-pill icon-pill--badge" [matMenuTriggerFor]="notifMenu"
                    aria-label="Notifications"
                    [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null"
                    matBadgeColor="warn" matBadgeSize="small">
              <mat-icon>notifications</mat-icon>
            </button>
            <mat-menu #notifMenu="matMenu">
              <div class="notif-panel" (click)="$event.stopPropagation()">
                <div class="notif-panel-header">
                  <span class="notif-panel-title">Notifications</span>
                  @if (notificationService.unreadCount() > 0) {
                    <button mat-button class="notif-mark-read" (click)="notificationService.markAllRead()">
                      Mark all read
                    </button>
                  }
                </div>
                <mat-divider />
                <div class="notif-list">
                  @for (notif of notificationService.notifications(); track notif.id) {
                    <div class="notif-item" [class.notif-item--unread]="!notif.read">
                      <div class="notif-icon notif-icon--{{ notif.type }}">
                        <mat-icon>{{ notif.icon }}</mat-icon>
                      </div>
                      <div class="notif-content">
                        <p class="notif-title">{{ notif.title }}</p>
                        <p class="notif-msg">{{ notif.message }}</p>
                        <p class="notif-time">{{ notif.time | date:'shortTime' }} · {{ notif.time | date:'mediumDate' }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </mat-menu>

            <button mat-icon-button class="header-icon-btn profile-btn"
                    matTooltip="Sign out"
                    (click)="onSignOut()"
                    aria-label="Sign out">
              <span class="avatar" aria-hidden="true">{{ avatarInitial() }}</span>
            </button>
          </div>
        </header>

        @if (loadingService.activeRequests() > 0) {
          <mat-progress-bar mode="indeterminate" class="loading-bar" aria-label="Loading"></mat-progress-bar>
        }

        <main class="page-content" id="main-content">
          <router-outlet />
        </main>

        <footer class="app-footer" role="contentinfo">
          <span>© 2026 Patient Account Portal · All rights reserved</span>
          <span class="footer-version">v1.0.0</span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 199; }
    .shell { display: flex; height: 100vh; overflow: hidden; background: var(--brand-gradient-soft); font-family: var(--font), sans-serif; }
    .sidebar {
      width: 260px; min-width: 260px; height: 100vh;
      display: flex; flex-direction: column;
      background: linear-gradient(180deg, #0b0933 0%, #040d5a 38%, #052580 100%);
      color: #d9e7ff; overflow: hidden; flex-shrink: 0;
      transition: width 200ms ease, min-width 200ms ease; z-index: 200;
      box-shadow: var(--shadow-xl);
    }
    .sidebar--collapsed { width: 64px; min-width: 64px; }
    .sidebar--mobile { position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform 200ms ease; box-shadow: 4px 0 20px rgba(0,0,0,.4); }
    .sidebar--mobile-open { transform: translateX(0); }
    .sidebar-logo { display: flex; align-items: center; gap: .75rem; padding: 1.125rem 1rem; border-bottom: 1px solid rgba(255,255,255,.08); min-height: 64px; flex-shrink: 0; }
    .logo-icon-wrap { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,.18); color: #fff; flex-shrink: 0; box-shadow: 0 10px 24px rgba(0,0,0,.18); }
    .logo-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .logo-text { display: flex; flex-direction: column; overflow: hidden; }
    .logo-name { font-size: .95rem; font-weight: 700; color: #fff; white-space: nowrap; }
    .logo-sub  { font-size: .68rem; color: rgba(217,231,255,.72); white-space: nowrap; }
    .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: .5rem 0; }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 2px; }
    .nav-section { padding: .25rem 0; }
    .nav-section-label { display: block; padding: .4rem 1rem; font-size: .63rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: rgba(217,231,255,.58); white-space: nowrap; }
    .nav-item { display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem; margin: 1px .5rem; border-radius: 12px; color: rgba(217,231,255,.82); font-size: .875rem; font-weight: 500; text-decoration: none; white-space: nowrap; transition: background 150ms, color 150ms, transform 150ms, box-shadow 150ms; }
    .nav-item:hover { background: rgba(255,255,255,.08); color: #fff; transform: translateX(1px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
    .nav-item--active { background: rgba(255,255,255,.16) !important; color: #fff !important; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 10px 24px rgba(0,0,0,.14); }
    .nav-item--active mat-icon { color: #dff4ff; }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .sidebar-collapse-btn { display: flex; align-items: center; justify-content: center; padding: .75rem; margin: .5rem; border-radius: 12px; border: none; background: rgba(255,255,255,.08); cursor: pointer; color: rgba(255,255,255,.76); transition: background 150ms, transform 150ms; }
    .sidebar-collapse-btn:hover { background: rgba(255,255,255,.14); color: #fff; transform: translateY(-1px); }
    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .app-header { height: 64px; min-height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; background: var(--header-bg); border-bottom: 1px solid var(--header-border); gap: 1rem; flex-shrink: 0; box-shadow: var(--shadow-sm); backdrop-filter: blur(12px); }
    .header-start { display: flex; align-items: center; gap: .375rem; flex: 1; min-width: 0; }
    .header-end { display: flex; align-items: center; gap: .25rem; }
    .breadcrumb { display: flex; align-items: center; gap: .125rem; overflow: hidden; }
    .crumb-link { font-size: .82rem; color: var(--clr-text-2); text-decoration: none; white-space: nowrap; }
    .crumb-link:hover { color: #1565C0; }
    .crumb-sep { font-size: 16px; color: var(--clr-text-3); width: 16px; height: 16px; }
    .crumb-current { font-size: .82rem; font-weight: 600; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-search { display: flex; align-items: center; gap: .5rem; background: rgba(243, 247, 255, 0.9); border: 1px solid rgba(205, 220, 245, 0.95); border-radius: 12px; padding: .3rem .75rem; max-width: 280px; width: 100%; box-shadow: var(--shadow-xs); }
    .header-search mat-icon { font-size: 18px; color: var(--clr-text-3); flex-shrink: 0; }
    .search-input { border: none; background: transparent; outline: none; font-size: .84rem; color: var(--clr-text); width: 100%; }
    .search-input::placeholder { color: var(--clr-text-3); }
    @media (max-width: 768px) { .header-search { display: none; } }
    .header-icon-btn { color: var(--clr-text-2); }
    .icon-pill {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(243, 247, 255, 0.9);
      border: 1px solid rgba(205, 220, 245, 0.95);
      box-shadow: var(--shadow-xs);
      transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
    }
    .icon-pill:hover:not(:disabled) {
      background: #fff;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    .icon-pill:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-xs);
    }
    .icon-pill mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .icon-pill--badge { position: relative; }
    .avatar { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #156fe8, #00a7c8); color: #fff; font-size: .8rem; font-weight: 700; flex-shrink: 0; box-shadow: 0 10px 20px rgba(21,111,232,.22); }
    .avatar--lg { width: 40px; height: 40px; font-size: 1rem; }
    .profile-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(243, 247, 255, 0.9);
      border: 1px solid rgba(205, 220, 245, 0.95);
      box-shadow: var(--shadow-xs);
      transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
    }
    .profile-btn:hover:not(:disabled) {
      background: #fff;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
    }
    .profile-btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-xs);
    }
    .loading-bar { height: 2px; flex-shrink: 0; }
    .page-content { flex: 1; overflow-y: auto; padding: 1.5rem; background: linear-gradient(180deg, rgba(238,245,255,0.55) 0%, rgba(246,250,255,0.9) 100%); }
    .page-content::-webkit-scrollbar { width: 6px; }
    .page-content::-webkit-scrollbar-thumb { background: var(--clr-border); border-radius: 3px; }
    .app-footer { display: flex; align-items: center; justify-content: space-between; padding: .6rem 1.5rem; background: rgba(255,255,255,.88); border-top: 1px solid rgba(205,220,245,.95); font-size: .75rem; color: var(--clr-text-3); flex-shrink: 0; backdrop-filter: blur(10px); }
    .notif-panel { width: 340px; max-height: 420px; display: flex; flex-direction: column; }
    .notif-panel { background: rgba(255,255,255,.97); border: 1px solid rgba(205,220,245,.95); border-radius: 16px; box-shadow: var(--shadow-lg); overflow: hidden; }
    .notif-panel-header { display: flex; align-items: center; justify-content: space-between; padding: .75rem 1rem .5rem; }
    .notif-panel-title { font-size: .92rem; font-weight: 600; color: var(--clr-text); }
    .notif-mark-read { font-size: .78rem; }
    .notif-list { overflow-y: auto; flex: 1; }
    .notif-item { display: flex; gap: .75rem; padding: .75rem 1rem; transition: background 150ms; }
    .notif-item:hover { background: var(--clr-surface-2); }
    .notif-item--unread { background: rgba(21,111,232,.05); }
    .notif-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
    .notif-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .notif-icon--info    { background: rgba(11,95,207,.12); color: #0b5fcf; }
    .notif-icon--success { background: rgba(46,125,50,.12); color: #2E7D32; }
    .notif-icon--warning { background: rgba(230,81,0,.12);  color: #E65100; }
    .notif-icon--error   { background: rgba(198,40,40,.12); color: #C62828; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title { margin: 0; font-size: .84rem; font-weight: 600; color: var(--clr-text); }
    .notif-msg   { margin: .1rem 0 0; font-size: .78rem; color: var(--clr-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .notif-time  { margin: .2rem 0 0; font-size: .72rem; color: var(--clr-text-3); }
    .mat-mdc-menu-panel { border-radius: 16px !important; overflow: hidden; }
    .mat-mdc-menu-panel .mat-mdc-menu-item { min-height: 44px; }
    @media (max-width: 768px) { .page-content { padding: 1rem; } }
  `],
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  readonly notificationService = inject(NotificationService);
  readonly breadcrumbService = inject(BreadcrumbService);
  readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly isMobile = signal(false);
  searchQueryValue = '';

  readonly navSections = computed(() => this.buildNavSections());

  avatarInitial(): string {
    const name = this.authStore.username();
    return name ? name[0].toUpperCase() : 'U';
  }

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (result.matches) { this.mobileOpen.set(false); }
      });
  }

  onSignOut(): void {
    void this.authStore.logout();
  }

  onSearchSubmit(): void {
    const query = this.searchQueryValue.trim();
    if (!query) {
      return;
    }

    void this.router.navigate(['/patients'], {
      queryParams: { search: query },
      queryParamsHandling: 'merge',
    });
  }

  private hasAnyRole(roles?: AppRole[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    const assigned = this.authStore.roles();
    return roles.some(
      (role) => assigned.includes(role) || assigned.includes(`ROLE_${role}`)
    );
  }

  private buildNavSections(): NavSection[] {
    const grouped = new Map<string, NavSection>();

    for (const item of SIDEBAR_NAV_ITEMS) {
      if (!this.hasAnyRole(item.roles)) {
        continue;
      }

      if (!grouped.has(item.section)) {
        grouped.set(item.section, { label: item.section, items: [] });
      }

      grouped.get(item.section)!.items.push({
        label: item.label,
        icon: item.icon,
        route: item.route,
      });
    }

    return Array.from(grouped.values());
  }
}
