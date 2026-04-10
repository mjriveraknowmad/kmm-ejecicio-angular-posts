import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { CommentsService } from '../../../services/comments.service';
import { CommentWithUser } from '../../../models/comment.model';
import { CommentFormComponent } from '../comment-form/comment-form';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner';
import { InfiniteScrollDirective } from '../../../../../shared/directives/infinite-scroll/infinite-scroll.directive';

@Component({
  selector: 'app-comment-section',
  imports: [
    TranslocoModule,
    DatePipe,
    CommentFormComponent,
    LoadingSpinnerComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './comment-section.html',
})
export class CommentSectionComponent {
  readonly postId = input.required<number>();

  protected auth = inject(AuthService);
  private commentsService = inject(CommentsService);
  private transloco = inject(TranslocoService);
  readonly currentLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  private readonly LIMIT = 5;

  readonly allComments = signal<CommentWithUser[]>([]);
  readonly total = signal(0);
  readonly isLoading = signal(false);
  private currentPage = signal(1);

  readonly hasMore = computed(() => this.allComments().length < this.total());

  readonly comments = computed(() => this.allComments());

  readonly countLabel = computed(() => {
    const n = this.total();
    return n < 10 ? `0${n}` : `${n}`;
  });

  readonly isAdding = signal(false);

  constructor() {
    effect(() => {
      const postId = this.postId();
      untracked(() => {
        this.allComments.set([]);
        this.total.set(0);
        this.currentPage.set(1);
        this.loadPage(postId, 1);
      });
    });
  }

  loadMore() {
    if (this.isLoading() || !this.hasMore()) return;
    const next = this.currentPage() + 1;
    this.currentPage.set(next);
    this.loadPage(this.postId(), next);
  }

  private loadPage(postId: number, page: number) {
    this.isLoading.set(true);
    this.commentsService.getPage(postId, page, this.LIMIT).subscribe({
      next: ({ comments, total }) => {
        this.allComments.update((current) => (page === 1 ? comments : [...current, ...comments]));
        this.total.set(total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private reloadAll() {
    const pages = this.currentPage();
    this.isLoading.set(true);
    this.commentsService.getPage(this.postId(), 1, this.LIMIT * pages).subscribe({
      next: ({ comments, total }) => {
        this.allComments.set(comments);
        this.total.set(total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  addComment(body: string) {
    this.isAdding.set(true);
    this.commentsService.create(this.postId(), body).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.reloadAll();
      },
      error: () => this.isAdding.set(false),
    });
  }

  deleteComment(id: number) {
    this.commentsService.delete(id).subscribe(() => this.reloadAll());
  }
}
