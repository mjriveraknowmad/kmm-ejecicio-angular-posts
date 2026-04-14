import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { TranslocoModule } from '@jsverse/transloco';

interface CommentData {
  body: string;
}

@Component({
  selector: 'app-comment-form',
  imports: [TranslocoModule, FormField],
  templateUrl: './comment-form.html',
})
export class CommentFormComponent {
  readonly isLoading = input(false);
  readonly comment = input<string | null>(null);
  readonly commentSubmit = output<string>();

  private readonly commentModel = signal<CommentData>({ body: '' });
  readonly commentForm = form(this.commentModel, (f) => {
    required(f.body);
  });

  constructor() {
    // Sync form value when switching into edit mode
    effect(() => {
      const val = this.comment();
      if (val !== null && val !== undefined) {
        this.commentModel.set({ body: val });
      } else {
        this.commentModel.set({ body: '' });
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.commentForm, async () => {
      const body = this.commentModel().body.trim();
      if (!body) return;
      this.commentSubmit.emit(body);
      if (this.comment() === null) {
        this.commentModel.set({ body: '' });
      }
    });
  }
}
