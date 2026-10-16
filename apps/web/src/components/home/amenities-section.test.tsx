import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { amenitiesSeed } from '@campus/contracts';

import { AmenitiesSection } from '@/components/home/amenities-section';

// jsdom applies no CSS, so both layouts are in the DOM here: the marquee (below `md`) and the
// bento grid (from `md`). The responsive suite checks that only one shows at a time.
function bento() {
  const lists = screen.getAllByRole('list', { name: 'Amenities' });
  const grid = lists.find((list) => list.className.includes('md:grid'));
  if (!grid) throw new Error('no bento grid');
  return grid;
}

describe('AmenitiesSection', () => {
  it('numbers its eyebrow and titles the region', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} number={2} />);
    expect(screen.getByRole('region', { name: 'Everything the day needs.' })).toBeInTheDocument();
    expect(screen.getByText('Amenities', { selector: 'p' })).toHaveTextContent('02 — Amenities');
  });

  it('lists every amenity with its description in the bento', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} />);
    const tiles = within(bento()).getAllByRole('heading', { level: 3 });
    expect(tiles).toHaveLength(amenitiesSeed.length);
    for (const amenity of amenitiesSeed) {
      const tile = within(bento()).getByRole('heading', { name: amenity.name }).closest('li');
      expect(tile).toHaveTextContent(amenity.description);
    }
  });

  it('gives every amenity one cell, leading with the first on the lake band', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} />);
    const [first, second] = within(bento()).getAllByRole('listitem');
    expect(first).toHaveClass('surface-brand');
    expect(second).not.toHaveClass('surface-brand');
    for (const tile of within(bento()).getAllByRole('listitem').slice(0, amenitiesSeed.length)) {
      expect(tile.className).not.toMatch(/col-span|row-span/);
    }
  });

  it('closes the last row with a link to every space, spanning the cells left', () => {
    render(<AmenitiesSection amenities={amenitiesSeed} />);
    const link = within(bento()).getByRole('link', { name: 'See every space' });
    expect(link).toHaveAttribute('href', '/spaces');
    // 11 amenities: one cell left of 3 columns, and one of 4.
    expect(link.closest('li')).toHaveClass('md:col-span-1', '2xl:col-span-1');
  });

  it('gives the link a whole row when the amenities fill theirs', () => {
    // 12 amenities fill rows of 3 and of 4.
    const twelve = [...amenitiesSeed, ...amenitiesSeed]
      .slice(0, 12)
      .map((amenity, i) => ({ ...amenity, id: `${amenity.id}-${String(i)}` }));
    render(<AmenitiesSection amenities={twelve} />);
    expect(
      within(bento()).getByRole('link', { name: 'See every space' }).closest('li'),
    ).toHaveClass('md:col-span-3', '2xl:col-span-4');
  });

  it('is a plain list of names in the SSR HTML on phones (the marquee only moves with JS)', () => {
    const html = renderToString(<AmenitiesSection amenities={amenitiesSeed} />);
    expect(html).not.toContain('Pause scrolling list');
    expect(html).toContain('Unlimited Tea &amp; Coffee');
  });

  it('renders nothing without amenities', () => {
    const { container } = render(<AmenitiesSection amenities={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
