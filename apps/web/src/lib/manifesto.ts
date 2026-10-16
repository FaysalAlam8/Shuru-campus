import { type Brand } from '@campus/contracts';

import { type MediaSource } from '@/lib/hero-media';

/**
 * What each pillar means here, finishing a sentence the pillar starts ("Empower your
 * business…"). Drawn from the About copy (docs/02-content.md → About copy). Keyed by the
 * pillar in lower case, so a renamed pillar simply has no statement until one is written.
 */
const STATEMENTS: Readonly<Record<string, string>> = {
  empower:
    'your business with a head-start: a shared workspace and office services, without setting them up alone.',
  enhance: 'your work in a professional, tranquil and buoyant atmosphere.',
  enrich: 'your days alongside businesses, entrepreneurs and independent professionals.',
};

export interface ManifestoStatement {
  /** The pillar as the brand writes it ("Empower"). */
  pillar: string;
  /** The rest of the sentence. */
  rest: string;
}

/** The rest of a pillar's statement, or `undefined` when none is written for it. */
export function pillarStatement(pillar: string): string | undefined {
  return STATEMENTS[pillar.trim().toLowerCase()];
}

/**
 * The Home manifesto (docs/05-pages-and-interactions.md → Home #2): one statement per brand
 * pillar, in the brand's order. Pillars without a statement are left out.
 */
export function manifestoStatements(pillars: Brand['pillars']): ManifestoStatement[] {
  return pillars.flatMap((pillar) => {
    const rest = pillarStatement(pillar);
    return rest ? [{ pillar: pillar.trim(), rest }] : [];
  });
}

/**
 * The quiet desk beside the manifesto (B4): square, from `lg` only, where the statements leave the
 * title column empty. A stock stand-in from `scripts/fetch-photos.mjs`.
 * TODO(client): real photos and usage rights (docs/09-roadmap.md #3); swap the file and alt here.
 */
export const MANIFESTO_MEDIA = {
  alt: 'Placeholder photo: a quiet desk by a curtained window',
  src: '/placeholder/workspace-2.jpg',
  width: 1200,
  height: 1500,
} as const satisfies MediaSource & { alt: string };
