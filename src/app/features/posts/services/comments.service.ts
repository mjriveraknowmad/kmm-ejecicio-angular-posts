import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Comment, CommentWithUser } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  getPage(postId: number, page: number, limit = 5) {
    return this.http
      .get<CommentWithUser[]>('/api/comments', {
        params: {
          postId,
          _expand: 'user',
          _page: page,
          _limit: limit,
          _sort: 'createdAt',
          _order: 'desc',
        },
        observe: 'response',
      })
      .pipe(
        map((res) => ({
          comments: res.body ?? [],
          total: Number(res.headers.get('X-Total-Count') ?? 0),
        })),
      );
  }

  create(postId: number, body: string) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.http.post<Comment>('/api/comments', {
      postId,
      userId,
      body,
      createdAt: new Date().toISOString(),
    });
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/comments/${id}`);
  }

  update(id: number, body: string) {
    return this.http.put<Comment>(`/api/comments/${id}`, { body });
  }
}
