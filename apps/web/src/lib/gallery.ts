import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryImage } from '@campus/contracts';

/**
 * The Gallery's filter chips (docs/05-pages-and-interactions.md → Gallery), in display order.
 * `subject` finishes "Showing 3 photos …".
 */
export const GALLERY_FILTERS = [
  { value: 'workspace', label: 'Workspace', subject: 'of the workspace' },
  { value: 'meeting', label: 'Meeting rooms', subject: 'of the meeting rooms' },
  { value: 'cafe', label: 'Café', subject: 'of the café' },
  { value: 'events', label: 'Events', subject: 'from our events' },
] as const satisfies readonly { value: GalleryCategory; label: string; subject: string }[];

/** The query parameter that carries the category: `/gallery?category=cafe`. */
export const CATEGORY_PARAM = 'category';

/** `?category=` as a category, or `undefined` (every photo) when missing, repeated or unknown. */
export function parseCategory(
  raw: string | string[] | null | undefined,
): GalleryCategory | undefined {
  if (typeof raw !== 'string') return undefined;
  return GALLERY_CATEGORIES.find((category) => category === raw);
}

export function categoryInfo(category: GalleryCategory): (typeof GALLERY_FILTERS)[number] {
  const info = GALLERY_FILTERS.find((entry) => entry.value === category);
  // GALLERY_FILTERS lists every category; this keeps the type honest.
  if (!info) throw new Error(`Unknown gallery category ${category}`);
  return info;
}

/** The photos in `category`, in their own order; every photo without one. */
export function filterGallery(
  images: readonly GalleryImage[],
  category: GalleryCategory | undefined,
): GalleryImage[] {
  return category ? images.filter((image) => image.category === category) : [...images];
}

/**
 * Where to send someone who chose an empty category ("Nothing in Events yet. Try Workspace."):
 * the first other category, in chip order, that has photos.
 */
export function suggestCategory(
  images: readonly GalleryImage[],
  except: GalleryCategory,
): GalleryCategory | undefined {
  const present = new Set(images.map((image) => image.category));
  return GALLERY_FILTERS.find(({ value }) => value !== except && present.has(value))?.value;
}

/** What the grid is showing, announced as it changes: "Showing 3 photos of the café." */
export function gallerySummary(category: GalleryCategory | undefined, matching: number): string {
  if (!category)
    return matching === 1 ? 'Showing the one photo.' : `Showing all ${String(matching)} photos.`;
  const { label, subject } = categoryInfo(category);
  if (matching === 0) return `Nothing in ${label} yet.`;
  if (matching === 1) return `Showing the one photo ${subject}.`;
  return `Showing ${String(matching)} photos ${subject}.`;
}

/**
 * How a photo sits in the three-column grid (from `lg`): in a pair row, the narrower photo is
 * `tall` (one column, 4:5) beside the wider one, `wide` (two columns, the row's height); a triple
 * row is three `cell`s (4:3), or `square`s when it holds a portrait; a lone photo is `full`.
 */
export type GalleryTileShape = 'full' | 'tall' | 'wide' | 'cell' | 'square';

export interface GalleryTile {
  image: GalleryImage;
  shape: GalleryTileShape;
  /** At two columns (`sm` to `lg`), spans both: the odd one out at the end. */
  spansPair: boolean;
}

const aspect = (image: GalleryImage) => image.width / image.height;

/**
 * Lays the photos out in rows that always end flush, so the grid never leaves a gap: at three
 * columns every row is a pair (tall + wide) or a triple, with as many pairs as there are
 * portraits, as far as the count allows (pairs × 2 + triples × 3 = photos). Pair rows take the
 * narrowest and widest photos left, so portraits stand tall and wide shots stay wide; triples
 * take the rest in their own order. Pair and triple rows alternate, and pairs swap sides.
 * The returned order is the display order (and the lightbox's).
 */
export function arrangeGallery(images: readonly GalleryImage[]): GalleryTile[] {
  const count = images.length;
  const [first] = images;
  if (!first) return [];
  if (count === 1) return [{ image: first, shape: 'full', spansPair: true }];

  const portraits = images.filter((image) => aspect(image) < 1).length;
  // The fewest pairs that leave a multiple of three, then three more at a time while that gets
  // closer to one pair per portrait.
  let pairs = (2 * count) % 3;
  while (
    2 * (pairs + 3) <= count &&
    Math.abs(pairs + 3 - portraits) < Math.abs(pairs - portraits)
  ) {
    pairs += 3;
  }
  let triples = (count - 2 * pairs) / 3;

  const left = [...images];
  const take = (pick: (a: GalleryImage, b: GalleryImage) => boolean): GalleryImage => {
    let best = 0;
    left.forEach((image, i) => {
      const current = left[best];
      if (current && pick(image, current)) best = i;
    });
    const [image] = left.splice(best, 1);
    if (!image) throw new Error('arrangeGallery ran out of photos');
    return image;
  };

  const rows: Omit<GalleryTile, 'spansPair'>[][] = [];
  const pairRows: GalleryImage[][] = [];
  for (let i = 0; i < pairs; i++) {
    const tall = take((a, b) => aspect(a) < aspect(b));
    const wide = take((a, b) => aspect(a) > aspect(b));
    pairRows.push([tall, wide]);
  }
  let pairIndex = 0;
  while (pairIndex < pairRows.length || triples > 0) {
    const pair = pairRows[pairIndex];
    if (pair) {
      const [tall, wide] = pair as [GalleryImage, GalleryImage];
      const row = [
        { image: tall, shape: 'tall' as const },
        { image: wide, shape: 'wide' as const },
      ];
      rows.push(pairIndex % 2 === 0 ? row : row.reverse());
      pairIndex++;
    }
    if (triples > 0) {
      const row = left.splice(0, 3);
      const shape = row.some((image) => aspect(image) < 1) ? 'square' : 'cell';
      rows.push(row.map((image) => ({ image, shape })));
      triples--;
    }
  }

  return rows
    .flat()
    .map((tile, i, all) => ({ ...tile, spansPair: count % 2 === 1 && i === all.length - 1 }));
}
