import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsService } from '../services/posts.service';
import { PostPrefetchService } from '../services/post-prefetch.service';
import { UsersService } from '../services/users.service';
import { PostWithUser, Post } from '../models/post.model';
import { PostCardComponent } from './components/post-card/post-card';
import { PostFiltersComponent } from './components/post-filters/post-filters';
import { PaginationComponent } from './components/pagination/pagination';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';

const PAGE_SIZE = 4;

@Component({
  selector: 'app-post-list-page',
  imports: [
    TranslocoModule,
    PostCardComponent,
    PostFiltersComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './post-list-page.html',
})
export class PostListPageComponent {
  private router = inject(Router);
  private postsService = inject(PostsService);
  private prefetchService = inject(PostPrefetchService);
  protected auth = inject(AuthService);
  protected usersService = inject(UsersService);

  // Query param inputs via withComponentInputBinding()
  page = input(1, {
    transform: (v: string | number) => {
      const n = numberAttribute(v);
      return Number.isNaN(n) ? 1 : n;
    },
  });
  q = input('');
  userId = input(''); // string from URL, converted to number in loader
  tag = input('');

  // Load all posts (minimal) to extract unique tags across the whole dataset
  private readonly allPostsResource = httpResource<Post[]>(() => ({
    url: '/api/posts',
    params: { _limit: 1000 },
  }));

  readonly availableTags = computed(() => {
    const posts = this.allPostsResource.value() ?? [];
    const tagSet = new Set<string>();
    for (const post of posts) {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((t) => tagSet.add(t.trim()));
      }
    }
    return [...tagSet].sort();
  });

  // Posts resource using httpResource() — headers() exposes X-Total-Count
  readonly postsResource = httpResource<PostWithUser[]>(() => {
    const params: Record<string, string | number> = {
      _page: this.page(),
      _limit: PAGE_SIZE,
      _expand: 'user',
    };
    if (this.q()) params['q'] = this.q();
    if (this.userId()) params['userId'] = Number(this.userId());
    if (this.tag()) params['tags_like'] = this.tag();
    return { url: '/api/posts', params };
  });

  readonly posts = computed(() => this.postsResource.value() ?? []);
  readonly total = computed(() => Number(this.postsResource.headers()?.get('X-Total-Count') ?? 0));
  readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  readonly selectedUserId = computed(() => (this.userId() ? Number(this.userId()) : undefined));

  onPageChange(page: number) {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  onAuthorChange(userId: number | undefined) {
    this.router.navigate([], {
      queryParams: { userId: userId ?? null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onTagChange(tag: string) {
    this.router.navigate([], {
      queryParams: { tag: tag || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onDeletePost(id: number) {
    this.postsService.delete(id).subscribe(() => this.postsResource.reload());
  }

  onPrefetch(id: number) {
    this.prefetchService.prefetch(id);
  }

  onCancelPrefetch(id: number) {
    this.prefetchService.cancelPrefetch(id);
  }
}
