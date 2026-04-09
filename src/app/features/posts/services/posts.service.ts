import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  create(data: Pick<Post, 'title' | 'body' | 'tags'>) {
    return this.http.post<Post>('/api/posts', {
      ...data,
      userId: this.auth.currentUser()!.id,
      createdAt: new Date().toISOString(),
    });
  }

  update(id: number, data: Pick<Post, 'title' | 'body' | 'tags' | 'userId' | 'createdAt'>) {
    return this.http.put<Post>(`/api/posts/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/posts/${id}`);
  }
}
