import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { PaginationComponent } from './pagination';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

const translocoConfig: TranslocoTestingOptions = {
  langs: { es: {}, en: {} },
  translocoConfig: { defaultLang: 'es' },
};

describe('PaginationComponent', () => {
  describe('pages computed signal', () => {
    function getPages(currentPage: number, totalPages: number): (number | '...')[] {
      const component = TestBed.runInInjectionContext(() => {
        const c = new PaginationComponent();
        // Set inputs by directly calling the underlying signal setters
        // (Angular signals-based inputs expose the value via a getter)
        Object.defineProperty(c, 'currentPage', { value: () => currentPage });
        Object.defineProperty(c, 'totalPages', { value: () => totalPages });
        return c;
      });
      return component.pages();
    }

    it('should return all pages when total <= 7', () => {
      expect(getPages(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should include ellipsis at end when current is near start', () => {
      const result = getPages(2, 10);
      expect(result[0]).toBe(1);
      expect(result).toContain('...');
      expect(result[result.length - 1]).toBe(10);
    });

    it('should include ellipsis at start when current is near end', () => {
      const result = getPages(9, 10);
      expect(result[0]).toBe(1);
      expect(result).toContain('...');
      expect(result[result.length - 1]).toBe(10);
    });

    it('should include ellipsis on both sides when current is in the middle', () => {
      const result = getPages(5, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
      const ellipsisCount = result.filter((p) => p === '...').length;
      expect(ellipsisCount).toBe(2);
    });

    it('should always include current page in result', () => {
      [1, 3, 5, 8, 10].forEach((page) => {
        expect(getPages(page, 10)).toContain(page);
      });
    });
  });

  describe('rendered component', () => {
    async function setup(currentPage: number, totalPages: number) {
      const user = userEvent.setup();
      const result = await render(PaginationComponent, {
        imports: [TranslocoTestingModule.forRoot(translocoConfig)],
        inputs: { currentPage, totalPages },
      });
      return { ...result, user };
    }

    it('should not render when totalPages is 1', async () => {
      await setup(1, 1);
      expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('should render page buttons for small page count', async () => {
      await setup(2, 5);
      expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '5' })).toBeTruthy();
    });

    it('should emit pageChange with correct value when page button is clicked', async () => {
      const { user, fixture } = await setup(1, 5);
      const emitted: number[] = [];
      fixture.componentInstance.pageChange.subscribe((v: number) => emitted.push(v));

      await user.click(screen.getByRole('button', { name: '3' }));
      expect(emitted).toEqual([3]);
    });

    it('should not emit when current page button is clicked', async () => {
      const { user, fixture } = await setup(2, 5);
      const emitted: number[] = [];
      fixture.componentInstance.pageChange.subscribe((v: number) => emitted.push(v));

      await user.click(screen.getByRole('button', { name: '2' }));
      expect(emitted).toEqual([]);
    });
  });
});
