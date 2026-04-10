import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import {
  TranslocoService,
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';
import { PostCardComponent } from './post-card';
import { PostWithUser } from '../../../models/post.model';

registerLocaleData(localeEs);

const translocoConfig: TranslocoTestingOptions = {
  langs: { es: {}, en: {} },
  translocoConfig: { defaultLang: 'es' },
};

const mockPost: PostWithUser = {
  id: 1,
  userId: 1,
  title: 'Test Post Title',
  body: 'Body content here.',
  tags: ['angular', 'signals'],
  createdAt: '2026-01-15T10:00:00.000Z',
  user: { id: 1, name: 'Alice Smith', avatar: '' },
};

async function setup(post: PostWithUser, currentUserId?: number) {
  return render(PostCardComponent, {
    providers: [provideRouter([])],
    imports: [TranslocoTestingModule.forRoot(translocoConfig)],
    inputs: { post, currentUserId },
  });
}

describe('PostCardComponent', () => {
  it('should render the post title', async () => {
    await setup(mockPost);
    expect(screen.getByText('Test Post Title')).toBeTruthy();
  });

  it('should render the post body', async () => {
    await setup(mockPost);
    expect(screen.getByText('Body content here.')).toBeTruthy();
  });

  it('should render all tags', async () => {
    await setup(mockPost);
    expect(screen.getByText('angular')).toBeTruthy();
    expect(screen.getByText('signals')).toBeTruthy();
  });

  it('should render author name', async () => {
    await setup(mockPost);
    expect(screen.getByText('Alice Smith')).toBeTruthy();
  });

  describe('initials', () => {
    it('should show two-letter initials for first and last name', async () => {
      await setup(mockPost);
      expect(screen.getByText('AS')).toBeTruthy();
    });

    it('should show single initial for single-word name', async () => {
      const post: PostWithUser = {
        ...mockPost,
        user: { id: 1, name: 'alice', avatar: '' },
      };
      await setup(post);
      expect(screen.getByText('A')).toBeTruthy();
    });

    it('should show ? when user is not present', async () => {
      const post: PostWithUser = { ...mockPost, user: undefined };
      await setup(post);
      expect(screen.getByText('?')).toBeTruthy();
    });
  });

  describe('link', () => {
    it('should link title to post detail route', async () => {
      await setup(mockPost);
      const link = screen.getByRole('link', { name: 'Test Post Title' });
      expect(link.getAttribute('href')).toBe('/posts/1');
    });
  });

  describe('createdAt date', () => {
    it('should format date using Spanish locale when lang is es', async () => {
      await setup(mockPost);
      // January in es locale → "ene." → uppercased → "ENE."
      expect(screen.getByText(/ENE/)).toBeTruthy();
    });

    it('should format date using English locale when lang is en', async () => {
      const { fixture } = await setup(mockPost);
      const transloco = fixture.debugElement.injector.get(TranslocoService);
      transloco.setActiveLang('en');
      await fixture.whenStable();
      fixture.detectChanges();
      // January in en locale → "Jan" → uppercased → "JAN"
      expect(screen.getByText(/JAN/)).toBeTruthy();
    });

    it('should reactively reformat when language switches from es to en', async () => {
      const { fixture } = await setup(mockPost);

      expect(screen.getByText(/ENE/)).toBeTruthy();

      const transloco = fixture.debugElement.injector.get(TranslocoService);
      transloco.setActiveLang('en');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(screen.getByText(/JAN/)).toBeTruthy();
      expect(screen.queryByText(/ENE/)).toBeNull();
    });
  });
});
