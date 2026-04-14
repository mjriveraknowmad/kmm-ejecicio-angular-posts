import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { PostsService } from './posts.service';
import { Post, PostWithUser } from '../models/post.model';

/** Flush pending microtasks then Angular effects. */
async function flushAll() {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  TestBed.flushEffects();
}

const mockPost: Post = {
  id: 1,
  userId: 1,
  title: 'Test Post',
  body: 'Test body',
  tags: ['angular'],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockPostWithUser: PostWithUser = {
  ...mockPost,
  user: { id: 1, name: 'alice', avatar: '' },
};

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOne()', () => {
    it('should return a resource that fetches a post by id with _expand=user', async () => {
      let resource: ReturnType<typeof service.getOne> | undefined;

      TestBed.runInInjectionContext(() => {
        resource = service.getOne(() => '1');
      });

      TestBed.flushEffects();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/posts/1' && r.params.get('_expand') === 'user',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPostWithUser);
      await flushAll();

      expect(resource!.value()).toEqual(mockPostWithUser);
    });

    it('should expose error() when the request fails', async () => {
      let resource: ReturnType<typeof service.getOne> | undefined;

      TestBed.runInInjectionContext(() => {
        resource = service.getOne(() => '99');
      });

      TestBed.flushEffects();

      httpMock
        .expectOne((r) => r.url === '/api/posts/99')
        .error(new ProgressEvent('network error'));
      await flushAll();

      // value() throws when resource is in error state; check error() instead
      expect(resource!.error()).toBeTruthy();
    });
  });

  describe('getOneForEdit()', () => {
    it('should fetch a plain Post by id without _expand when id is provided', async () => {
      let resource: ReturnType<typeof service.getOneForEdit> | undefined;

      TestBed.runInInjectionContext(() => {
        resource = service.getOneForEdit(() => '1');
      });

      TestBed.flushEffects();

      const req = httpMock.expectOne('/api/posts/1');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('_expand')).toBe(false);
      req.flush(mockPost);
      await flushAll();

      expect(resource!.value()).toEqual(mockPost);
    });

    it('should not issue a request when id is undefined', async () => {
      TestBed.runInInjectionContext(() => {
        service.getOneForEdit(() => undefined);
      });

      TestBed.flushEffects();

      httpMock.expectNone(() => true);
    });

    it('should expose error() when the request fails', async () => {
      let resource: ReturnType<typeof service.getOneForEdit> | undefined;

      TestBed.runInInjectionContext(() => {
        resource = service.getOneForEdit(() => '1');
      });

      TestBed.flushEffects();

      httpMock.expectOne('/api/posts/1').error(new ProgressEvent('network error'));
      await flushAll();

      // value() throws when resource is in error state; check error() instead
      expect(resource!.error()).toBeTruthy();
    });
  });

  describe('delete()', () => {
    it('should send DELETE to /api/posts/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne('/api/posts/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
