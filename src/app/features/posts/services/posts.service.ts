import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Post, PostWithUser } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  create(data: Pick<Post, 'title' | 'body' | 'tags'>) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.http.post<Post>('/api/posts', {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  update(id: number, data: Pick<Post, 'title' | 'body' | 'tags' | 'userId' | 'createdAt'>) {
    return this.http.put<Post>(`/api/posts/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/posts/${id}`);
  }

  getOne(id: () => string) {
    return httpResource<PostWithUser>(() => ({
      url: `/api/posts/${id()}`,
      params: { _expand: 'user' },
    }));
  }

  getOneForEdit(id: () => string | undefined) {
    return httpResource<Post>(() => (id() ? { url: `/api/posts/${id()}` } : undefined));
  }
}
