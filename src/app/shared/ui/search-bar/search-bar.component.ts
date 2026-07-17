import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="search-field" [class.search-field--full]="fullWidth">
      <mat-icon matPrefix>search</mat-icon>
      <mat-label>{{ placeholder }}</mat-label>
      <input
        matInput
        [(ngModel)]="query"
        (ngModelChange)="onInput($event)"
        [disabled]="disabled"
        autocomplete="off"
        spellcheck="false" />
      @if (query) {
        <button mat-icon-button matSuffix type="button" (click)="clear()" aria-label="Clear search">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styles: [`
    :host { display: inline-block; }

    .search-field { min-width: 220px; }
    .search-field--full { width: 100%; }
  `],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search…';
  @Input() debounceMs = 320;
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() initialValue = '';

  @Output() readonly searchChange = new EventEmitter<string>();
  @Output() readonly cleared = new EventEmitter<void>();

  query = '';

  private readonly subject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.initialValue) {
      this.query = this.initialValue;
    }

    this.subject$
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => this.searchChange.emit(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(value: string): void {
    this.subject$.next(value);
  }

  clear(): void {
    this.query = '';
    this.subject$.next('');
    this.cleared.emit();
  }
}


