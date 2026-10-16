import Image from 'next/image';

import { type Brand } from '@campus/contracts';

import { ScrollText } from '@/components/motion/scroll-text';
import { MANIFESTO_MEDIA, manifestoStatements } from '@/lib/manifesto';
import { sentence } from '@/lib/metadata';

// The photo column: five of twelve columns of the content width (it's only shown from `lg`).
const SIZES = '(min-width: 100rem) 37rem, 38vw';

export interface ManifestoProps {
  pillars: Brand['pillars'];
  /** The brand's sub-tagline, under the title. */
  subTagline?: Brand['subTagline'];
}

/**
 * Home #2 (docs/05-pages-and-interactions.md): the brand's pillars as the section title, then
 * one statement per pillar, each opening with the pillar itself. Each statement's words
 * brighten in reading order as it scrolls up the page (`<ScrollText>`: scroll-linked CSS,
 * so it needs no JS; full strength without support or under reduced motion). Renders nothing
 * when no pillar has a statement (a renamed brand). A compact band: from `lg` a photo fills the
 * left column at exactly the text's height (mirroring the hero, photo right), so neither side
 * runs past the other.
 */
export function Manifesto({ pillars, subTagline }: ManifestoProps) {
  const statements = manifestoStatements(pillars);
  if (statements.length === 0) return null;
  const names = statements.map((s) => s.pillar);

  return (
    <section aria-labelledby="manifesto-title" className="bg-bg-alt">
      <div className="mx-auto grid max-w-content gap-8 py-16 px-page-safe lg:grid-cols-12 lg:gap-gutter lg:py-20">
        {/* Only from `lg`: below it the text stands alone. It takes the row's height from the
            text and crops to it, so it never sets the height itself. */}
        <div className="relative hidden overflow-hidden rounded-lg bg-bg lg:col-span-5 lg:block">
          <Image
            src={MANIFESTO_MEDIA.src}
            alt={MANIFESTO_MEDIA.alt}
            fill
            sizes={SIZES}
            className="object-cover photo-tone"
          />
        </div>

        <div className="flex flex-col gap-8 lg:col-span-7 lg:py-6 xl:pl-8">
          <div className="flex flex-col gap-4">
            {/* Seen as "Empower · Enhance · Enrich", heard as a list rather than "dot". */}
            <h2
              id="manifesto-title"
              aria-label={names.join(', ')}
              className="type-eyebrow text-fg-muted"
            >
              {names.join(' · ')}
            </h2>
            {subTagline ? (
              <p className="max-w-md text-pretty text-fg-muted">{sentence(subTagline)}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-8 border-t border-border pt-8">
            {statements.map(({ pillar, rest }) => (
              <ScrollText
                key={pillar}
                parts={[{ text: `${pillar} `, em: true, strong: true }, ...rest]}
                className="type-h3 font-light text-fg"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
