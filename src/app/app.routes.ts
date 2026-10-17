import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro/cadastro').then((m) => m.Cadastro),
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
