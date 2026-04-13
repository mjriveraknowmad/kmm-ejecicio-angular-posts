import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService, UserOption } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
    httpMock.expectOne('/api/users').flush([]);
  });

  it('should return an empty array before data is loaded', () => {
    expect(service.users()).toEqual([]);
    httpMock.expectOne('/api/users').flush([]);
  });

  it('should expose isLoading as true while the request is in flight', () => {
    expect(service.isLoading()).toBe(true);
    httpMock.expectOne('/api/users').flush([]);
  });

  it('should populate users signal after a successful HTTP response', () => {
    const mockUsers: UserOption[] = [
      { id: 1, name: 'alice' },
      { id: 2, name: 'bruno' },
      { id: 3, name: 'carla' },
    ];

    httpMock.expectOne('/api/users').flush(mockUsers);

    expect(service.users()).toEqual(mockUsers);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeUndefined();
  });

  it('should return empty array and expose error after an HTTP error', () => {
    httpMock.expectOne('/api/users').error(new ProgressEvent('network error'));

    expect(service.users()).toEqual([]);
    expect(service.error()).toBeTruthy();
  });
});
