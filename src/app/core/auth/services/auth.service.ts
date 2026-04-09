import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AuthUser, User } from '../models/user.model';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<AuthUser | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly token = computed(() => this._currentUser()?.token ?? null);

  login(name: string, password: string) {
    return this.http.get<User[]>(`/api/users`, { params: { name, password } }).pipe(
      map((users) => {
        if (!users.length) throw new Error('Invalid credentials');
        return users[0];
      }),
      tap((user) => {
        const token = btoa(`${user.id}:${user.name}:${Date.now()}`);
        const authUser: AuthUser = { ...user, token };
        this._currentUser.set(authUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      }),
    );
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
