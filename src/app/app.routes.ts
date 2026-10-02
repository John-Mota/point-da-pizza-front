import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'styleguide',
    loadComponent: () => import('./features/styleguide/styleguide').then((m) => m.Styleguide),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
