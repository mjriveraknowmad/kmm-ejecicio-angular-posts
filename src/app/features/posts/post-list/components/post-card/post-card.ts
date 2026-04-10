import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PostWithUser } from '../../../models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, DatePipe, UpperCasePipe, TranslocoModule],
  templateUrl: './post-card.html',
})
export class PostCardComponent {
  post = input.required<PostWithUser>();
  currentUserId = input<number | undefined>();

  private transloco = inject(TranslocoService);
  readonly currentLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly isOwner = computed(() => this.post().userId === this.currentUserId());

  readonly initials = computed(() => {
    const name = this.post().user?.name ?? '?';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  });
}
