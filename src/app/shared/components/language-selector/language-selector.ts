import { Component, effect, inject, output, Signal, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <div
      class="relative flex items-center w-36 h-7 select-none"
      role="group"
      [attr.aria-label]="'common.languageSelector' | transloco"
    >
      <div class="absolute w-full h-full bg-[#D9D9D9] rounded-[10px]"></div>
      <div class="flex items-center justify-around w-full h-full px-1">
        @for (lang of langs; track lang) {
          <button
            type="button"
            class="z-10 px-3 py-0.5 rounded-[10px] text-xs font-medium transition-colors duration-150 cursor-pointer "
            [class]="
              currentLang() === lang ? 'bg-[#2A6BF3] text-white' : 'bg-transparent text-black'
            "
            (click)="setLang(lang + '')"
            aria-pressed="{{ currentLang() === lang }}"
          >
            {{ (lang + '').toUpperCase() }}
          </button>
        }
      </div>
    </div>
  `,
})
export class LanguageSelectorComponent {
  languageChange = output<string>();

  private transloco = inject(TranslocoService);
  private langSignal = signal(this.transloco.getActiveLang());
  langs = this.transloco.getAvailableLangs();

  currentLang: Signal<string> = this.langSignal;

  constructor() {
    effect(() => {
      this.transloco.setActiveLang(this.langSignal());
    });
  }

  setLang(lang: string) {
    if (this.langSignal() !== lang) {
      this.langSignal.set(lang);
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
      this.languageChange.emit(lang);
    }
  }
}
