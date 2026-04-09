import { Routes } from '@angular/router';
import { postOwnerGuard } from './guards/post-owner.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./post-list/post-list-page').then((m) => m.PostListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./post-editor/post-editor-page').then((m) => m.PostEditorPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./post-detail/post-detail-page').then((m) => m.PostDetailPageComponent),
  },
  {
    path: ':id/edit',
    canActivate: [postOwnerGuard],
    loadComponent: () =>
      import('./post-editor/post-editor-page').then((m) => m.PostEditorPageComponent),
  },
] as Routes;
