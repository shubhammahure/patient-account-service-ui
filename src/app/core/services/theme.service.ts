import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDarkMode = signal<boolean>(
    localStorage.getItem('theme') === 'dark'
  );

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggle(): void {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}

