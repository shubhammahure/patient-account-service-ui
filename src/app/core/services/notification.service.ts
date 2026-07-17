import { Injectable, computed, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _list = signal<AppNotification[]>([
    {
      id: '1',
      type: 'warning',
      icon: 'payment',
      title: 'Payment case overdue',
      message: 'Case PTP-ABCD1234 is past due date',
      time: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      type: 'success',
      icon: 'check_circle',
      title: 'PFE case approved',
      message: 'Financial estimate for patient #101 approved',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      icon: 'person_add',
      title: 'New patient registered',
      message: 'John Doe registered successfully',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      type: 'error',
      icon: 'local_hospital',
      title: 'Admission review required',
      message: 'Patient #202 admission needs clinical review',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  readonly notifications = this._list.asReadonly();
  readonly unreadCount = computed(() => this._list().filter((n) => !n.read).length);

  markAllRead(): void {
    this._list.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this._list.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  add(notification: Omit<AppNotification, 'id' | 'read'>): void {
    this._list.update((list) => [
      { ...notification, id: String(Date.now()), read: false },
      ...list,
    ]);
  }
}

