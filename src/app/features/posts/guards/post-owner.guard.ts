import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';

export const postOwnerGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);
  const id = route.paramMap.get('id');

  if (!id) return router.createUrlTree(['/posts']);

  return http.get<Post>(`/posts/${id}`).pipe(
    map((post) => {
      const user = auth.currentUser();
      if (user && post.userId === user.id) return true;
      return router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/posts']))),
  );
};
