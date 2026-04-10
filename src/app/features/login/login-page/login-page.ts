import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/services/auth.service';
import { LoginData } from '../models/login.model';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector';

@Component({
  selector: 'app-login-page',
  imports: [TranslocoModule, FormField, LanguageSelectorComponent],
  templateUrl: './login-page.html',
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loginModel = signal<LoginData>({ name: '', password: '' });

  readonly loginForm = form(this.loginModel, (f) => {
    required(f.name);
    required(f.password);
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().invalid()) {
      this.errorMessage.set('login.form.validationError');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, password } = this.loginModel();
    this.auth.login(name, password).subscribe({
      next: () => this.router.navigate(['/posts']),
      error: (er) => {
        console.log(er);
        this.errorMessage.set('login.errors.invalidCredentials');
        this.isLoading.set(false);
      },
    });
  }
}
