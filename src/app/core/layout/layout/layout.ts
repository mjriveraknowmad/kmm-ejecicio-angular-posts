import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, TranslocoModule],
  templateUrl: './layout.html',
})
export class LayoutComponent {}
