import { Component, input, output, signal } from '@angular/core';
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
  readonly commentSubmit = output<string>();

  private readonly commentModel = signal<CommentData>({ body: '' });
  readonly commentForm = form(this.commentModel, (f) => {
    required(f.body);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.commentForm, async () => {
      const body = this.commentModel().body.trim();
      if (!body) return;
      this.commentSubmit.emit(body);
      this.commentModel.set({ body: '' });
    });
  }
}
