import { Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

interface UserOption {
  id: number;
  name: string;
}

const ALL_TAGS = [
  'angular',
  'architecture',
  'forms',
  'i18n',
  'performance',
  'routing',
  'signals',
  'tailwind',
  'testing',
  'zoneless',
];

@Component({
  selector: 'app-post-filters',
  imports: [TranslocoModule],
  templateUrl: './post-filters.html',
})
export class PostFiltersComponent {
  users = input<UserOption[]>([]);
  selectedUserId = input<number | undefined>();
  selectedTag = input<string>('');
  totalCount = input<number>(0);
  currentCount = input<number>(0);

  authorChange = output<number | undefined>();
  tagChange = output<string>();

  readonly allTags = ALL_TAGS;

  onAuthorChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.authorChange.emit(value ? Number(value) : undefined);
  }

  onTagChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.tagChange.emit(value);
  }
}
