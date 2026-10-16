import { type Brand } from '@campus/contracts';

import { ScrollText } from '@/components/motion/scroll-text';
import { manifestoStatements } from '@/lib/manifesto';
import { sentence } from '@/lib/metadata';

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
 * when no pillar has a statement (a renamed brand). A compact band: three short statements need
 * less than a full section's padding, so it sits closer to the hero and Spaces either side.
 */
export function Manifesto({ pillars, subTagline }: ManifestoProps) {
  const statements = manifestoStatements(pillars);
  if (statements.length === 0) return null;
  const names = statements.map((s) => s.pillar);

  return (
    <section aria-labelledby="manifesto-title" className="bg-bg-alt">
      <div className="mx-auto grid max-w-content gap-8 py-16 px-page-safe lg:grid-cols-12 lg:items-center lg:gap-gutter lg:py-20">
        <div className="flex flex-col gap-4 lg:col-span-4">
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
        </div>
        <div className="flex flex-col gap-8 lg:col-span-8">
          {statements.map(({ pillar, rest }) => (
            <ScrollText
              key={pillar}
              parts={[{ text: `${pillar} `, em: true, strong: true }, ...rest]}
              className="type-h3 font-light text-fg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
