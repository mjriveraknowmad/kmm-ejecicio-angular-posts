import { Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';

interface UserOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-post-filters',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './post-filters.html',
})
export class PostFiltersComponent {
  users = input<UserOption[]>([]);
  tags = input<string[]>([]);
  selectedUserId = input<number | undefined>();
  selectedTag = input<string>('');
  totalCount = input<number>(0);
  currentCount = input<number>(0);

  authorChange = output<number | undefined>();
  tagChange = output<string>();

  onAuthorChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.authorChange.emit(value ? Number(value) : undefined);
  }

  onTagChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.tagChange.emit(value);
  }
}
