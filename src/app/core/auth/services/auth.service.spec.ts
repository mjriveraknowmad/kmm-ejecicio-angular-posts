import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthUser } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when localStorage is empty', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  describe('login()', () => {
    it('should set currentUser and persist token on success', () => {
      const mockUser = { id: 1, name: 'alice', email: 'alice@example.com', avatar: '' };

      service.login('alice', 'alice123').subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/users'));
      expect(req.request.params.get('name')).toBe('alice');
      expect(req.request.params.get('password')).toBe('alice123');
      req.flush([mockUser]);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.name).toBe('alice');
      expect(service.token()).toBeTruthy();
      expect(localStorage.getItem('auth_user')).not.toBeNull();
    });

    it('should throw when credentials are invalid (empty array response)', () => {
      let errorThrown = false;

      service.login('alice', 'wrong').subscribe({
        error: () => (errorThrown = true),
      });

      httpMock.expectOne((r) => r.url.includes('/api/users')).flush([]);

      expect(errorThrown).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout()', () => {
    it('should clear user, token and localStorage then navigate to /login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const stored: AuthUser = {
        id: 1,
        name: 'alice',
        email: 'alice@example.com',
        avatar: '',
        token: 'test-token',
      };
      localStorage.setItem('auth_user', JSON.stringify(stored));

      // Re-create service so it picks up localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);
      const freshRouter = TestBed.inject(Router);
      const spy = vi.spyOn(freshRouter, 'navigate');

      expect(freshService.isAuthenticated()).toBe(true);

      freshService.logout();

      expect(freshService.isAuthenticated()).toBe(false);
      expect(freshService.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(spy).toHaveBeenCalledWith(['/login']);

      // suppress unused variable warning
      void navigateSpy;
    });
  });

  describe('session persistence', () => {
    it('should restore session from localStorage on init', () => {
      const stored: AuthUser = {
        id: 2,
        name: 'bruno',
        email: 'bruno@example.com',
        avatar: '',
        token: 'abc123',
      };
      localStorage.setItem('auth_user', JSON.stringify(stored));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isAuthenticated()).toBe(true);
      expect(freshService.currentUser()?.name).toBe('bruno');
      expect(freshService.token()).toBe('abc123');
    });
  });
});
