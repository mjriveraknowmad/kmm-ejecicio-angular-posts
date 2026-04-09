import { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth/guards/guest.guard';

export default [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPageComponent),
  },
] as Routes;
