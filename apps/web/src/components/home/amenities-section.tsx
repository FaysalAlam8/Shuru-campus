import { ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

import { type Amenity } from '@campus/contracts';

import { Marquee } from '@/components/motion/marquee';
import { SectionHeading } from '@/components/sections/section-heading';
import { AmenityGlyph } from '@/lib/amenity-icons';
import { cn } from '@/lib/cn';

export interface AmenitiesSectionProps {
  amenities: readonly Amenity[];
  /** Position on Home, for the eyebrow. */
  number?: number;
}

const TITLE_ID = 'amenities-title';

// The grid is 3 columns from `md` and 4 from `2xl` (narrower, four would wrap the names). Every
// amenity takes one cell; the link card after them spans what's left of the last row (a whole
// row when the amenities fill theirs), so the grid always closes.
const MD_COLUMNS = 3;
const XXL_COLUMNS = 4;
const MD_SPAN: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
};
const XXL_SPAN: Record<number, string> = {
  1: '2xl:col-span-1',
  2: '2xl:col-span-2',
  3: '2xl:col-span-3',
  4: '2xl:col-span-4',
};

/** The cells left in the last row after `count` single cells, or a whole row when it's full. */
function remainder(count: number, columns: number): number {
  return columns - (count % columns);
}

/** The 48px icon circle (B3). It fills with accent-subtle and the icon nudges up on hover. */
function AmenityIcon({ icon, inverse = false }: { icon: Amenity['icon']; inverse?: boolean }) {
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-fast ease-out group-hover/tile:bg-accent-subtle group-hover/tile:text-fg',
        inverse ? 'bg-on-brand text-brand-surface' : 'bg-bg-alt text-fg',
      )}
    >
      <AmenityGlyph
        icon={icon}
        aria-hidden="true"
        className="size-6 transition-transform duration-fast ease-out group-hover/tile:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/tile:translate-y-0"
        strokeWidth={1.5}
      />
    </span>
  );
}

/**
 * Home #5 (docs/05-pages-and-interactions.md): what's on site. A bento grid of one-row tiles from
 * `md`, led by the first amenity on the lake band, two columns wide; below `md`, a marquee row with a pause button (a wrapped
 * list without JS or with reduced motion). Renders nothing when there are no amenities: it's a
 * supporting section, so if they fail to load Home simply goes without it.
 */
export function AmenitiesSection({ amenities, number }: AmenitiesSectionProps) {
  if (amenities.length === 0) return null;

  return (
    <section aria-labelledby={TITLE_ID} className="bg-bg-alt">
      <div className="mx-auto max-w-content py-section px-page-safe">
        <SectionHeading
          id={TITLE_ID}
          number={number}
          eyebrow="Amenities"
          title={
            <>
              Everything the day <em>needs</em>.
            </>
          }
          lead="The essentials are already here, so you can get straight to work."
        />

        <Marquee
          label="Amenities"
          className="mt-10 md:hidden"
          items={amenities.map((amenity) => (
            // A surface chip, so the icon circle shows against the section's bg-alt.
            <span
              key={amenity.id}
              className="inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1.5 pr-5 text-fg"
            >
              <AmenityIcon icon={amenity.icon} />
              <span className="font-medium whitespace-nowrap">{amenity.name}</span>
            </span>
          ))}
        />

        <ul
          aria-label="Amenities"
          className="mt-14 hidden auto-rows-fr gap-4 md:grid md:grid-cols-3 lg:gap-gutter 2xl:grid-cols-4"
        >
          {amenities.map((amenity, i) => {
            // The first amenity leads, on the lake band.
            const feature = i === 0;
            return (
              <li
                key={amenity.id}
                // Icon beside the text, as tall as its content: a name and a line need no more.
                className={cn(
                  'group/tile flex items-center gap-4 rounded-md border p-5',
                  feature
                    ? 'border-transparent surface-brand dark:border-border'
                    : 'border-border bg-surface',
                )}
              >
                <AmenityIcon icon={amenity.icon} inverse={feature} />
                <div className="min-w-0">
                  <h3 className={feature ? 'type-h3' : 'font-medium text-fg'}>{amenity.name}</h3>
                  <p className={cn('mt-0.5', feature ? 'text-body' : 'text-small text-fg-muted')}>
                    {amenity.description}
                  </p>
                </div>
              </li>
            );
          })}
          <li
            className={cn(
              MD_SPAN[remainder(amenities.length, MD_COLUMNS)],
              XXL_SPAN[remainder(amenities.length, XXL_COLUMNS)],
            )}
          >
            <NextLink
              href="/spaces"
              className="group/more flex h-full min-h-hit items-center justify-between gap-4 rounded-md border border-dashed border-border-strong p-5 font-medium text-fg transition-colors duration-fast ease-out hover:bg-surface"
            >
              See every space
              <ArrowRight
                aria-hidden="true"
                className="size-5 shrink-0 transition-transform duration-fast ease-out group-hover/more:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/more:translate-x-0"
                strokeWidth={1.5}
              />
            </NextLink>
          </li>
        </ul>
      </div>
    </section>
  );
}
