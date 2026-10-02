import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'styleguide',
    loadComponent: () => import('./features/styleguide/styleguide').then((m) => m.Styleguide),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'styleguide',
  },
];
