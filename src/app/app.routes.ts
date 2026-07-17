import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginPageComponent } from './features/auth/login.page';
import { RoutePlaceholderComponent } from './shared/ui/route-placeholder/route-placeholder.component';
import { ForbiddenPageComponent } from './features/errors/forbidden.page';
import { UnauthorizedPageComponent } from './features/errors/unauthorized.page';

export type AppRole = 'ADMIN' | 'DOCTOR' | 'REGISTRAR' | 'BILLING' | 'PFE_REVIEWER';

export interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  section: 'Overview' | 'Patient Care' | 'Financial' | 'System';
  roles?: AppRole[];
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
	label: 'Dashboard',
	icon: 'dashboard',
	route: '/dashboard',
	section: 'Overview',
	roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING', 'PFE_REVIEWER'],
  },
  {
	label: 'Patients',
	icon: 'people',
	route: '/patients',
	section: 'Patient Care',
	roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING'],
  },
  {
	label: 'Admissions',
	icon: 'local_hospital',
	route: '/admissions',
	section: 'Patient Care',
	roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'],
  },
  {
	label: 'Transfers',
	icon: 'swap_horiz',
	route: '/transfers',
	section: 'Patient Care',
	roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'],
  },
  {
	label: 'Mass Upload',
	icon: 'upload_file',
	route: '/mass-upload',
	section: 'Patient Care',
	roles: ['ADMIN', 'REGISTRAR'],
  },
  {
	label: 'PFE',
	icon: 'receipt_long',
	route: '/pfe',
	section: 'Financial',
	roles: ['ADMIN', 'REGISTRAR', 'PFE_REVIEWER'],
  },
  {
	label: 'Path To Payment',
	icon: 'payments',
	route: '/path-to-payment',
	section: 'Financial',
	roles: ['ADMIN', 'BILLING', 'REGISTRAR'],
  },
  {
	label: 'Profile',
	icon: 'account_circle',
	route: '/profile',
	section: 'System',
	roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING', 'PFE_REVIEWER'],
  },
  {
	label: 'Settings',
	icon: 'settings',
	route: '/settings',
	section: 'System',
	roles: ['ADMIN'],
  },
];

export const routes: Routes = [
  {
	path: 'auth',
	children: [
	  {
		path: 'login',
		component: LoginPageComponent,
	  },
	  {
		path: 'register',
		component: LoginPageComponent,
	  },
	  {
		path: '',
		pathMatch: 'full',
		redirectTo: 'login',
	  },
	],
  },
  {
	path: 'login',
	pathMatch: 'full',
	redirectTo: '/auth/login',
  },
  {
	path: '',
	component: ShellComponent,
	canActivate: [authGuard],
	children: [
	  {
		path: 'dashboard',
		loadComponent: () =>
		  import('./features/dashboard/dashboard.page').then(
			(m) => m.DashboardPageComponent
		  ),
	  },
	  {
		path: 'patients',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING'] },
		loadComponent: () =>
		  import('./features/patients/patients.page').then(
			(m) => m.PatientsPageComponent
		  ),
	  },
	  {
		path: 'patients/register',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING'] },
		loadComponent: () =>
		  import('./features/patients/patient-register.page').then(
			(m) => m.PatientRegisterPageComponent
		  ),
	  },
	  {
		path: 'patients/:patientId/edit',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING'] },
		loadComponent: () =>
		  import('./features/patients/patient-edit.page').then(
			(m) => m.PatientEditPageComponent
		  ),
	  },
	  {
		path: 'patients/:patientId',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING'] },
		loadComponent: () =>
		  import('./features/patients/patient-details.page').then(
			(m) => m.PatientDetailsPageComponent
		  ),
	  },
	  {
		path: 'admissions',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'] },
		loadComponent: () =>
		  import('./features/admissions/admissions.page').then(
			(m) => m.AdmissionsPageComponent
		  ),
	  },
	  {
		path: 'admissions/:admissionId',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'] },
		loadComponent: () =>
		  import('./features/admissions/admission-details.page').then(
			(m) => m.AdmissionDetailsPageComponent
		  ),
	  },
	  {
		path: 'transfers',
		canActivate: [roleGuard],
		data: {
		  roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'],
		  title: 'Transfers',
		  subtitle: 'Patient transfer workflow',
		},
		loadComponent: () =>
		  import('./features/transfers/bulk-transfer.page').then(
			(m) => m.BulkTransferPageComponent
		  ),
	  },
	  {
		path: 'mass-upload',
		canActivate: [roleGuard],
		data: {
		  roles: ['ADMIN', 'REGISTRAR'],
		  title: 'Mass Upload',
		  subtitle: 'Bulk patient upload',
		},
		loadComponent: () =>
		  import('./features/mass-upload/bulk-upload.page').then(
			(m) => m.BulkUploadPageComponent
		  ),
	  },
	  {
		path: 'pfe',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'REGISTRAR', 'PFE_REVIEWER'] },
		loadComponent: () =>
		  import('./features/pfe/pfe-workflow.page').then(
			(m) => m.PfeWorkflowPageComponent
		  ),
	  },
	  {
		path: 'path-to-payment/:caseId',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'BILLING', 'REGISTRAR'] },
		loadComponent: () =>
		  import('./features/payment/payment-case-details.page').then(
			(m) => m.PaymentCaseDetailsPageComponent
		  ),
	  },
	  {
		path: 'path-to-payment',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'BILLING', 'REGISTRAR'] },
		loadComponent: () =>
		  import('./features/payment/payment-cases.page').then(
			(m) => m.PaymentCasesPageComponent
		  ),
	  },
	  {
		path: 'profile',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR', 'BILLING', 'PFE_REVIEWER'] },
		loadComponent: () =>
		  import('./features/profile/profile.page').then(
			(m) => m.ProfilePageComponent
		  ),
	  },
	  {
		path: 'settings',
		canActivate: [roleGuard],
		data: { roles: ['ADMIN'] },
		loadComponent: () =>
		  import('./features/settings/settings.page').then(
			(m) => m.SettingsPageComponent
		  ),
	  },
	  {
		path: 'payment-cases',
		pathMatch: 'full',
		redirectTo: 'path-to-payment',
	  },
	  {
		path: 'pfe-workflow',
		pathMatch: 'full',
		redirectTo: 'pfe',
	  },
	  {
		path: 'error/401',
		component: UnauthorizedPageComponent,
	  },
	  {
		path: 'error/403',
		data: {
		  title: 'Forbidden',
		  subtitle: 'You do not have permission to access this page.',
		},
		component: ForbiddenPageComponent,
	  },
	  {
		path: 'error/500',
		data: {
		  title: 'Server Error',
		  subtitle: 'An unexpected server error occurred.',
		},
		component: RoutePlaceholderComponent,
	  },
	  {
		path: 'error/404',
		data: {
		  title: 'Page Not Found',
		  subtitle: 'The route you requested does not exist.',
		},
		component: RoutePlaceholderComponent,
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
	redirectTo: '/error/404',
  },
];
