import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsService } from '../services/posts.service';
import { PostPrefetchService } from '../services/post-prefetch.service';
import { UsersService } from '../services/users.service';
import { PostWithUser } from '../models/post.model';
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
  private http = inject(HttpClient);
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

  // Posts resource using resource() to access X-Total-Count header
  readonly postsResource = resource({
    params: () => ({
      page: this.page(),
      q: this.q(),
      userId: this.userId(),
      tag: this.tag(),
    }),
    loader: ({ params }) => {
      const httpParams: Record<string, string | number> = {
        _page: params.page,
        _limit: PAGE_SIZE,
        _expand: 'user',
      };
      if (params.q) httpParams['q'] = params.q;
      if (params.userId) httpParams['userId'] = Number(params.userId);
      if (params.tag) httpParams['tags_like'] = params.tag;

      return firstValueFrom(
        this.http
          .get<PostWithUser[]>('/api/posts', { observe: 'response', params: httpParams })
          .pipe(
            map((resp) => ({
              posts: resp.body ?? [],
              total: parseInt(resp.headers.get('X-Total-Count') ?? '0', 10),
            })),
          ),
      );
    },
  });

  readonly posts = computed(() => this.postsResource.value()?.posts ?? []);
  readonly total = computed(() => this.postsResource.value()?.total ?? 0);
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
