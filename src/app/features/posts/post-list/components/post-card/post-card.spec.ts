import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { PostCardComponent } from './post-card';
import { PostWithUser } from '../../../models/post.model';

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
});
