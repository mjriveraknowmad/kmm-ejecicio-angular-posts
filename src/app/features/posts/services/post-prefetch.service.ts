import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostWithUser } from '../models/post.model';

const PREFETCH_DELAY_MS = 150;

@Injectable({ providedIn: 'root' })
export class PostPrefetchService {
  private http = inject(HttpClient);
  private cache = new Map<number, PostWithUser>();
  private pending = new Set<number>();
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  prefetch(id: number): void {
    if (this.cache.has(id) || this.pending.has(id) || this.timers.has(id)) return;

    const timer = setTimeout(() => {
      this.timers.delete(id);
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
    }, PREFETCH_DELAY_MS);

    this.timers.set(id, timer);
  }

  cancelPrefetch(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  get(id: number): PostWithUser | undefined {
    return this.cache.get(id);
  }
}
