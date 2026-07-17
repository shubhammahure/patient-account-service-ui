/**
 * Reusable Form Controls
 *
 * Exports:
 * - TextFieldComponent     — MatInput text/email/number/password wrapper
 * - SelectFieldComponent   — MatSelect wrapper with options[]
 * - DateFieldComponent     — MatInput[type=date] wrapper
 * - TextareaFieldComponent — MatTextarea wrapper
 */
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// ─────────────────────────────────────────────────
// Shared option type
// ─────────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string | number;
}

// ─────────────────────────────────────────────────
// Base mixin (inline to avoid extra file)
// ─────────────────────────────────────────────────
class BaseCVA implements ControlValueAccessor {
  readonly innerControl = new FormControl<unknown>(null);

  protected onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.innerControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
    this.innerControl.valueChanges.subscribe((v) => fn(v));
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    disabled ? this.innerControl.disable() : this.innerControl.enable();
  }
}

// ─────────────────────────────────────────────────
// Text Field
// ─────────────────────────────────────────────────
@Component({
  selector: 'app-text-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextFieldComponent),
    multi: true,
  }],
  template: `
    <mat-form-field [appearance]="appearance" class="field-full">
      @if (prefixIcon) {
        <mat-icon matPrefix>{{ prefixIcon }}</mat-icon>
      }
      <mat-label>{{ label }}</mat-label>
      <input matInput
             [type]="type"
             [placeholder]="placeholder"
             [formControl]="innerControl"
             (blur)="onTouched()" />
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      @if (innerControl.hasError('required')) {
        <mat-error>{{ label }} is required.</mat-error>
      }
      @if (innerControl.hasError('email')) {
        <mat-error>Enter a valid email.</mat-error>
      }
      @if (innerControl.hasError('min')) {
        <mat-error>Value is below minimum.</mat-error>
      }
      @if (innerControl.hasError('max')) {
        <mat-error>Value exceeds maximum.</mat-error>
      }
      @if (innerControl.hasError('minlength')) {
        <mat-error>Too short.</mat-error>
      }
      @if (innerControl.hasError('maxlength')) {
        <mat-error>Too long.</mat-error>
      }
    </mat-form-field>
  `,
  styles: [`.field-full { width: 100%; }`],
})
export class TextFieldComponent extends BaseCVA {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' = 'text';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() prefixIcon = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
}

// ─────────────────────────────────────────────────
// Select Field
// ─────────────────────────────────────────────────
@Component({
  selector: 'app-select-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectFieldComponent),
    multi: true,
  }],
  template: `
    <mat-form-field [appearance]="appearance" class="field-full">
      <mat-label>{{ label }}</mat-label>
      <mat-select [formControl]="innerControl" [multiple]="multiple" (blur)="onTouched()">
        @if (placeholder) {
          <mat-option [value]="null">{{ placeholder }}</mat-option>
        }
        @for (opt of options; track opt.value) {
          <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
        }
      </mat-select>
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      @if (innerControl.hasError('required')) {
        <mat-error>{{ label }} is required.</mat-error>
      }
    </mat-form-field>
  `,
  styles: [`.field-full { width: 100%; }`],
})
export class SelectFieldComponent extends BaseCVA {
  @Input() label = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() multiple = false;
  @Input() appearance: 'outline' | 'fill' = 'outline';
}

// ─────────────────────────────────────────────────
// Date Field
// ─────────────────────────────────────────────────
@Component({
  selector: 'app-date-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateFieldComponent),
    multi: true,
  }],
  template: `
    <mat-form-field [appearance]="appearance" class="field-full">
      <mat-label>{{ label }}</mat-label>
      <input matInput type="date"
             [formControl]="innerControl"
             [min]="min"
             [max]="max"
             (blur)="onTouched()" />
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      @if (innerControl.hasError('required')) {
        <mat-error>{{ label }} is required.</mat-error>
      }
    </mat-form-field>
  `,
  styles: [`.field-full { width: 100%; }`],
})
export class DateFieldComponent extends BaseCVA {
  @Input() label = '';
  @Input() hint = '';
  @Input() min = '';
  @Input() max = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
}

// ─────────────────────────────────────────────────
// Textarea Field
// ─────────────────────────────────────────────────
@Component({
  selector: 'app-textarea-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaFieldComponent),
    multi: true,
  }],
  template: `
    <mat-form-field [appearance]="appearance" class="field-full">
      <mat-label>{{ label }}</mat-label>
      <textarea matInput
                [rows]="rows"
                [placeholder]="placeholder"
                [formControl]="innerControl"
                (blur)="onTouched()"></textarea>
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      @if (innerControl.hasError('required')) {
        <mat-error>{{ label }} is required.</mat-error>
      }
      @if (innerControl.hasError('maxlength')) {
        <mat-error>Too long.</mat-error>
      }
    </mat-form-field>
  `,
  styles: [`.field-full { width: 100%; }`],
})
export class TextareaFieldComponent extends BaseCVA {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() rows = 3;
  @Input() appearance: 'outline' | 'fill' = 'outline';
}


