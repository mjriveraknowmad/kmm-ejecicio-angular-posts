import { computed, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';

export interface UserOption {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly #usersResource = httpResource<UserOption[]>(() => '/api/users');

  readonly users = computed(() => this.#usersResource.value() ?? []);
  readonly isLoading = computed(() => this.#usersResource.isLoading());
  readonly error = computed(() => this.#usersResource.error());
}
