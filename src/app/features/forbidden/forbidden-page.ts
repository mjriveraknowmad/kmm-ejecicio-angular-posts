import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-forbidden-page',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './forbidden-page.html',
})
export class ForbiddenPageComponent {}
