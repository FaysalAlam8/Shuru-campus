import Image from 'next/image';

import { type Brand } from '@campus/contracts';

import { ScrollText } from '@/components/motion/scroll-text';
import { MANIFESTO_MEDIA, manifestoStatements } from '@/lib/manifesto';
import { sentence } from '@/lib/metadata';

// The title column: four of twelve columns of the content width (it's only shown from `lg`).
const SIZES = '(min-width: 100rem) 26rem, 30vw';

export interface ManifestoProps {
  pillars: Brand['pillars'];
  /** The brand's sub-tagline, under the title. */
  subTagline?: Brand['subTagline'];
}

/**
 * Home #2 (docs/05-pages-and-interactions.md): the brand's pillars as the section title, then
 * one large statement per pillar, each opening with the pillar itself. Each statement's words
 * brighten in reading order as it scrolls up the page (`<ScrollText>`: scroll-linked CSS,
 * so it needs no JS; full strength without support or under reduced motion). Renders nothing
 * when no pillar has a statement (a renamed brand). From `lg` the title column also holds a
 * photo and stays in view under the header while the statements scroll past.
 */
export function Manifesto({ pillars, subTagline }: ManifestoProps) {
  const statements = manifestoStatements(pillars);
  if (statements.length === 0) return null;
  const names = statements.map((s) => s.pillar);

  return (
    <section aria-labelledby="manifesto-title" className="bg-bg-alt">
      <div className="mx-auto grid max-w-content gap-10 py-section px-page-safe lg:grid-cols-12 lg:gap-gutter">
        <div className="flex flex-col gap-4 lg:sticky lg:top-(--sticky-top) lg:col-span-4 lg:self-start lg:pt-4">
          {/* Seen as "Empower · Enhance · Enrich", heard as a list rather than "dot". */}
          <h2
            id="manifesto-title"
            aria-label={names.join(', ')}
            className="type-eyebrow text-fg-muted"
          >
            {names.join(' · ')}
          </h2>
          {subTagline ? (
            <p className="max-w-xs text-pretty text-fg-muted">{sentence(subTagline)}</p>
          ) : null}
          {/* Only from `lg`: below it the statements follow the title, with no column to fill. */}
          <div className="mt-6 hidden overflow-hidden rounded-lg bg-bg lg:block">
            <Image
              src={MANIFESTO_MEDIA.src}
              width={MANIFESTO_MEDIA.width}
              height={MANIFESTO_MEDIA.height}
              alt={MANIFESTO_MEDIA.alt}
              sizes={SIZES}
              className="block aspect-square h-auto w-full object-cover photo-tone"
            />
          </div>
        </div>
        <div className="flex flex-col gap-10 lg:col-span-8 lg:gap-16">
          {statements.map(({ pillar, rest }) => (
            <ScrollText
              key={pillar}
              parts={[{ text: pillar, em: true }, { text: rest }]}
              className="type-h2 text-fg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
