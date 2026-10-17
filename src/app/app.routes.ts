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
    path: 'home',
    pathMatch: 'full',
    redirectTo: '',
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home-page').then((m) => m.PdpHomePage),
  },
];

