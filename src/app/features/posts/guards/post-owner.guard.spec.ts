import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, ParamMap, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { postOwnerGuard } from './post-owner.guard';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthUser } from '../../../core/auth/models/user.model';

const mockState = {} as RouterStateSnapshot;

function makeRoute(id: string): ActivatedRouteSnapshot {
  return {
    paramMap: {
      get: (key: string) => (key === 'id' ? id : null),
    } as ParamMap,
  } as ActivatedRouteSnapshot;
}

describe('postOwnerGuard', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  function setup(currentUser: AuthUser | null) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);
    vi.spyOn(auth, 'currentUser').mockReturnValue(currentUser);
  }

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should allow owner to access edit route', async () => {
    const alice: AuthUser = { id: 1, name: 'alice', email: '', avatar: '', token: 'tok' };
    setup(alice);

    const result$ = TestBed.runInInjectionContext(() =>
      postOwnerGuard(makeRoute('1'), mockState),
    ) as Observable<boolean | UrlTree>;

    const resultPromise = firstValueFrom(result$);
    httpMock.expectOne('/api/posts/1').flush({ id: 1, userId: 1 });

    expect(await resultPromise).toBe(true);
  });

  it('should redirect to /forbidden for non-owner', async () => {
    const bruno: AuthUser = { id: 2, name: 'bruno', email: '', avatar: '', token: 'tok' };
    setup(bruno);

    const result$ = TestBed.runInInjectionContext(() =>
      postOwnerGuard(makeRoute('1'), mockState),
    ) as Observable<boolean | UrlTree>;

    const resultPromise = firstValueFrom(result$);
    httpMock.expectOne('/api/posts/1').flush({ id: 1, userId: 1 });

    expect(await resultPromise).toEqual(router.createUrlTree(['/forbidden']));
  });

  it('should redirect to /posts when post id is missing', () => {
    const alice: AuthUser = { id: 1, name: 'alice', email: '', avatar: '', token: 'tok' };
    setup(alice);

    const result = TestBed.runInInjectionContext(() => postOwnerGuard(makeRoute(''), mockState));

    expect(result).toEqual(router.createUrlTree(['/posts']));
  });
});
