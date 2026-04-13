import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { form, FormField, required } from '@angular/forms/signals';
import { PostsService } from '../services/posts.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { AuthService } from '../../../core/auth/services/auth.service';

interface PostFormData {
  title: string;
  body: string;
  tags: string;
  userId: number;
  createdAt: string;
}

@Component({
  selector: 'app-post-editor-page',
  imports: [TranslocoModule, FormField, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './post-editor-page.html',
})
export class PostEditorPageComponent {
  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());
  private router = inject(Router);
  private postsService = inject(PostsService);
  private auth = inject(AuthService);

  readonly postResource = this.postsService.getOneForEdit(() => this.id());

  readonly postModel = signal<PostFormData>({
    title: '',
    body: '',
    tags: '',
    createdAt: new Date().toISOString(),
    userId: this.auth.currentUser()?.id ?? 0,
  });

  readonly postForm = form(this.postModel, (f) => {
    required(f.title);
    required(f.body);
  });

  constructor() {
    effect(() => {
      const post = this.postResource.value();
      if (post) {
        this.postModel.set({
          title: post.title,
          body: post.body,
          tags: post.tags.join(', '),
          createdAt: post.createdAt,
          userId: post.userId,
        });
      }
    });
  }

  readonly isSaving = signal(false);

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.postForm().invalid()) return;

    this.isSaving.set(true);
    try {
      const { title, body, tags, createdAt, userId } = this.postModel();
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (this.isEditMode()) {
        await firstValueFrom(
          this.postsService.update(Number(this.id()), {
            title,
            body,
            tags: tagsArray,
            createdAt,
            userId,
          }),
        );
        await this.router.navigate(['/posts', this.id()]);
      } else {
        const post = await firstValueFrom(
          this.postsService.create({ title, body, tags: tagsArray }),
        );
        await this.router.navigate(['/posts', post.id]);
      }
    } finally {
      this.isSaving.set(false);
    }
  }

  onCancel() {
    if (this.isEditMode()) {
      this.router.navigate(['/posts', this.id()]);
    } else {
      this.router.navigate(['/posts']);
    }
  }
}
