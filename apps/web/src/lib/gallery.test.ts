import { describe, expect, it } from 'vitest';

import { GALLERY_CATEGORIES, gallerySeed, type GalleryImage } from '@campus/contracts';

import {
  arrangeGallery,
  categoryInfo,
  filterGallery,
  GALLERY_FILTERS,
  gallerySummary,
  parseCategory,
  suggestCategory,
} from '@/lib/gallery';

const only = (...categories: GalleryImage['category'][]) =>
  gallerySeed.filter((image) => categories.includes(image.category));

describe('gallery filters', () => {
  it('has one chip per category, in the order the page shows them', () => {
    expect(GALLERY_FILTERS.map((filter) => filter.value)).toEqual([...GALLERY_CATEGORIES]);
    expect(GALLERY_FILTERS.map((filter) => filter.label)).toEqual([
      'Workspace',
      'Meeting rooms',
      'Café',
      'Events',
    ]);
  });

  it('reads ?category= and ignores anything it does not know', () => {
    expect(parseCategory('cafe')).toBe('cafe');
    expect(parseCategory('lobby')).toBeUndefined();
    expect(parseCategory('')).toBeUndefined();
    expect(parseCategory(['cafe', 'events'])).toBeUndefined();
    expect(parseCategory(undefined)).toBeUndefined();
    expect(parseCategory(null)).toBeUndefined();
  });

  it('describes each category', () => {
    expect(categoryInfo('meeting')).toMatchObject({ label: 'Meeting rooms' });
    // @ts-expect-error: a category the contract doesn't have.
    expect(() => categoryInfo('lobby')).toThrow('Unknown gallery category lobby');
  });
});

describe('filterGallery', () => {
  it('keeps a category’s photos in their own order', () => {
    expect(filterGallery(gallerySeed, 'meeting').map((image) => image.id)).toEqual([
      'meeting-1',
      'meeting-2',
      'meeting-3',
    ]);
  });

  it('returns every photo, as a copy, without a category', () => {
    const all = filterGallery(gallerySeed, undefined);
    expect(all).toEqual(gallerySeed);
    expect(all).not.toBe(gallerySeed);
  });
});

describe('suggestCategory', () => {
  it('suggests the first other category that has photos', () => {
    expect(suggestCategory(only('cafe', 'events'), 'workspace')).toBe('cafe');
    expect(suggestCategory(only('workspace', 'events'), 'workspace')).toBe('events');
  });

  it('has nothing to suggest when no other category has photos', () => {
    expect(suggestCategory(only('events'), 'events')).toBeUndefined();
    expect(suggestCategory([], 'cafe')).toBeUndefined();
  });
});

describe('gallerySummary', () => {
  it('counts every photo without a category', () => {
    expect(gallerySummary(undefined, 10)).toBe('Showing all 10 photos.');
    expect(gallerySummary(undefined, 1)).toBe('Showing the one photo.');
  });

  it('names the category it shows', () => {
    expect(gallerySummary('meeting', 3)).toBe('Showing 3 photos of the meeting rooms.');
    expect(gallerySummary('cafe', 1)).toBe('Showing the one photo of the café.');
    expect(gallerySummary('events', 2)).toBe('Showing 2 photos from our events.');
  });

  it('says when a category is empty (B5)', () => {
    expect(gallerySummary('events', 0)).toBe('Nothing in Events yet.');
  });
});

describe('arrangeGallery', () => {
  // Columns each tile takes at three columns.
  const SPAN = { full: 3, tall: 1, wide: 2, cell: 1, square: 1 } as const;
  const photo = (id: string, width: number, height: number): GalleryImage => ({
    ...gallerySeed[0]!,
    id,
    width,
    height,
  });

  it('keeps every photo, once', () => {
    const tiles = arrangeGallery(gallerySeed);
    expect(tiles.map((tile) => tile.image.id).sort()).toEqual(
      gallerySeed.map((image) => image.id).sort(),
    );
  });

  it('ends every row flush at three columns, for any number of photos', () => {
    for (let count = 1; count <= 16; count++) {
      const images = Array.from({ length: count }, (_, i) =>
        i % 3 === 0 ? photo(`p${String(i)}`, 4, 5) : photo(`l${String(i)}`, 16, 9),
      );
      const tiles = arrangeGallery(images);
      expect(tiles).toHaveLength(count);
      let used = 0;
      for (const tile of tiles) {
        // A wide tile never straddles the end of a row.
        expect((used % 3) + SPAN[tile.shape]).toBeLessThanOrEqual(3);
        used += SPAN[tile.shape];
      }
      expect(used % 3).toBe(0);
    }
  });

  it('stands portraits tall beside the widest shots', () => {
    const tiles = arrangeGallery(gallerySeed);
    for (const tile of tiles.filter((t) => t.shape === 'wide')) {
      expect(tile.image.width).toBeGreaterThan(tile.image.height);
    }
    expect(
      tiles.filter((t) => t.shape === 'tall').every((t) => t.image.width < t.image.height),
    ).toBe(true);
  });

  it('lets the odd one out span both columns at two columns', () => {
    const odd = arrangeGallery(only('workspace'));
    expect(odd.map((tile) => tile.spansPair)).toEqual([false, false, true]);
    expect(arrangeGallery(gallerySeed).some((tile) => tile.spansPair)).toBe(false);
  });

  it('shows a lone photo full width, and nothing for no photos', () => {
    expect(arrangeGallery([gallerySeed[0]!])).toEqual([
      { image: gallerySeed[0], shape: 'full', spansPair: true },
    ]);
    expect(arrangeGallery([])).toEqual([]);
  });
});
