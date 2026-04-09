import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, LanguageSelectorComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
