import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostWithUser } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostPrefetchService {
  private http = inject(HttpClient);
  private cache = new Map<number, PostWithUser>();
  private pending = new Set<number>();

  prefetch(id: number): void {
    if (this.cache.has(id) || this.pending.has(id)) return;

    this.pending.add(id);
    this.http.get<PostWithUser>(`/api/posts/${id}`, { params: { _expand: 'user' } }).subscribe({
      next: (post) => {
        this.cache.set(id, post);
        this.pending.delete(id);
      },
      error: () => {
        this.pending.delete(id);
      },
    });
  }

  get(id: number): PostWithUser | undefined {
    return this.cache.get(id);
  }
}
