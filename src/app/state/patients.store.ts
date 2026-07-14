import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { PatientSummary } from '../core/models/api.models';
import type { PatientCreateRequest } from '../core/models/request.models';
import { ApiFacadeService } from '../core/services/api-facade.service';

@Injectable({ providedIn: 'root' })
export class PatientsStore {
  private readonly api = inject(ApiFacadeService);

  readonly rows = signal<PatientSummary[]>([]);
  readonly search = signal('');
  readonly status = signal('');
  readonly isLoading = signal(false);
  readonly error = signal('');

  setFilters(search: string, status: string): void {
    this.search.set(search);
    this.status.set(status);
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(
        this.api.searchPatients({ search: this.search(), status: this.status() }, 0, 20)
      );
      this.rows.set(response.content);
    } catch {
      this.error.set('Failed to load patients');
    } finally {
      this.isLoading.set(false);
    }
  }

  async create(payload: PatientCreateRequest): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.api.createPatient(payload));
      await this.load();
    } catch {
      this.error.set('Failed to create patient');
      this.isLoading.set(false);
    }
  }
}



