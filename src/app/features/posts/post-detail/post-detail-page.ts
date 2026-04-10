import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsService } from '../services/posts.service';
import { PostWithUser } from '../models/post.model';
import { CommentSectionComponent } from './components/comment-section/comment-section';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';

@Component({
  selector: 'app-post-detail-page',
  imports: [
    TranslocoModule,
    RouterLink,
    CommentSectionComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './post-detail-page.html',
})
export class PostDetailPageComponent {
  readonly id = input.required<string>();

  protected auth = inject(AuthService);
  private router = inject(Router);
  private postsService = inject(PostsService);

  readonly postResource = httpResource<PostWithUser>(() => ({
    url: `/api/posts/${this.id()}`,
    params: { _expand: 'user' },
  }));

  readonly idAsNumber = computed(() => Number(this.id()));

  readonly isOwner = computed(() => {
    const post = this.postResource.value();
    const user = this.auth.currentUser();
    return post != null && user != null && post.userId === user.id;
  });

  readonly isConfirmingDelete = signal(false);

  confirmDelete() {
    const post = this.postResource.value();
    if (!post) return;
    this.postsService.delete(post.id).subscribe(() => this.router.navigate(['/posts']));
  }
}
