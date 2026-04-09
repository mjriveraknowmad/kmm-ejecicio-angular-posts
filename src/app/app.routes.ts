import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes'),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'posts',
        loadChildren: () => import('./features/posts/posts.routes'),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./features/forbidden/forbidden-page').then((m) => m.ForbiddenPageComponent),
      },
      {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'posts',
  },
];
