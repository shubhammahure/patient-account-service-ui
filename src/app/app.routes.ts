import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginPageComponent } from './features/auth/login.page';

export const routes: Routes = [
  {
	path: 'login',
	component: LoginPageComponent,
  },
  {
	path: '',
	component: ShellComponent,
	canActivate: [authGuard],
	children: [
	  {
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPageComponent),
	  },
	  {
		path: 'patients',
		loadComponent: () => import('./features/patients/patients.page').then((m) => m.PatientsPageComponent),
	  },
	  {
		path: 'admissions',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'REGISTRAR', 'DOCTOR'] },
		loadComponent: () => import('./features/admissions/admissions.page').then((m) => m.AdmissionsPageComponent),
	  },
	  {
		path: 'payment-cases',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'BILLING', 'REGISTRAR'] },
		loadComponent: () => import('./features/payment/payment-cases.page').then((m) => m.PaymentCasesPageComponent),
	  },
	  {
		path: 'pfe-workflow',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'PFE_REVIEWER', 'REGISTRAR'] },
		loadComponent: () => import('./features/pfe/pfe-workflow.page').then((m) => m.PfeWorkflowPageComponent),
	  },
	  {
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard',
	  },
	],
  },
  {
	path: '**',
	redirectTo: '/dashboard',
  },
];
