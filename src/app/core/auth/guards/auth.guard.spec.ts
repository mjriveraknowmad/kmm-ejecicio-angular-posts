import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockSnapshot = {} as ActivatedRouteSnapshot;
const mockState = {} as RouterStateSnapshot;

describe('authGuard', () => {
  let router: Router;

  function setup(authenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    const auth = TestBed.inject(AuthService);
    vi.spyOn(auth, 'isAuthenticated').mockReturnValue(authenticated);
    return TestBed.runInInjectionContext(() => authGuard(mockSnapshot, mockState));
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should return true when user is authenticated', () => {
    const result = setup(true);
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    const result = setup(false);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
