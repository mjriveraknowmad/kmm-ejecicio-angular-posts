import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  create(postId: number, body: string) {
    return this.http.post<Comment>('/api/comments', {
      postId,
      userId: this.auth.currentUser()!.id,
      body,
      createdAt: new Date().toISOString(),
    });
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/comments/${id}`);
  }
}
