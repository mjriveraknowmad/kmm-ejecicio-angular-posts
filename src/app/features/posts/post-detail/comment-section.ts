import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CommentsService } from '../services/comments.service';
import { CommentWithUser } from '../models/comment.model';
import { CommentFormComponent } from './comment-form';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner';

@Component({
  selector: 'app-comment-section',
  imports: [TranslocoModule, DatePipe, CommentFormComponent, LoadingSpinnerComponent],
  templateUrl: './comment-section.html',
})
export class CommentSectionComponent {
  readonly postId = input.required<number>();

  protected auth = inject(AuthService);
  private commentsService = inject(CommentsService);

  readonly commentsResource = httpResource<CommentWithUser[]>(() => ({
    url: '/api/comments',
    params: { postId: this.postId(), _expand: 'user' },
  }));

  readonly comments = computed(() => this.commentsResource.value() ?? []);

  readonly countLabel = computed(() => {
    const n = this.comments().length;
    return n < 10 ? `0${n}` : `${n}`;
  });

  readonly isAdding = signal(false);

  addComment(body: string) {
    this.isAdding.set(true);
    this.commentsService.create(this.postId(), body).subscribe({
      next: () => {
        this.commentsResource.reload();
        this.isAdding.set(false);
      },
      error: () => this.isAdding.set(false),
    });
  }

  deleteComment(id: number) {
    this.commentsService.delete(id).subscribe(() => this.commentsResource.reload());
  }
}
