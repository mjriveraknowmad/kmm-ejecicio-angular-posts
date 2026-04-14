import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { UsersService, UserOption } from './users.service';

/** Flush any pending microtasks (Promise.resolve) and then Angular effects. */
async function flushAll() {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  TestBed.flushEffects();
}

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', async () => {
    expect(service).toBeTruthy();
    TestBed.flushEffects();
    httpMock.expectOne('/api/users').flush([]);
    await flushAll();
  });

  it('should return an empty array before data is loaded', async () => {
    TestBed.flushEffects();
    // request in flight — value not yet resolved
    expect(service.users()).toEqual([]);
    httpMock.expectOne('/api/users').flush([]);
    await flushAll();
  });

  it('should expose isLoading as true while the request is in flight', async () => {
    // isLoading is true from initial state before the response arrives
    expect(service.isLoading()).toBe(true);
    TestBed.flushEffects();
    httpMock.expectOne('/api/users').flush([]);
    await flushAll();
  });

  it('should populate users signal after a successful HTTP response', async () => {
    const mockUsers: UserOption[] = [
      { id: 1, name: 'alice' },
      { id: 2, name: 'bruno' },
      { id: 3, name: 'carla' },
    ];

    TestBed.flushEffects();
    httpMock.expectOne('/api/users').flush(mockUsers);
    await flushAll();

    expect(service.users()).toEqual(mockUsers);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeUndefined();
  });

  it('should return empty array and expose error after an HTTP error', async () => {
    TestBed.flushEffects();
    httpMock.expectOne('/api/users').error(new ProgressEvent('network error'));
    await flushAll();

    expect(service.users()).toEqual([]);
    expect(service.error()).toBeTruthy();
  });
});
