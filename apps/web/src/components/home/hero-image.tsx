import { getImageProps } from 'next/image';

import { cn } from '@/lib/cn';
import { HERO_MEDIA } from '@/lib/hero-media';

// Below `lg`, the content width: the 1440px container less its page margins (5vw each side, at
// most 80px). From `lg`, five of twelve columns of it.
const SIZES = '(min-width: 100rem) 34rem, (min-width: 64rem) 38vw, 90vw';

/**
 * The hero photo, art-directed with `<picture>` (B4): 4:5 on phones, 16:9 across the page from
 * `md`, then 4:5 again from `lg`, in the column beside the text. There it's capped to the first
 * screen (less the header and the hero's top padding) and crops rather than run below the fold.
 * It's the likely LCP element, so it loads eagerly at high priority and is never hidden: it only
 * settles from 1.05 to 1, and holds still under reduced motion. The `bg-alt` frame holds its
 * space until it loads.
 */
export function HeroImage({ className }: { className?: string }) {
  const common = {
    alt: HERO_MEDIA.alt,
    sizes: SIZES,
    loading: 'eager',
    fetchPriority: 'high',
  } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, ...HERO_MEDIA.wide });
  const { props: tall } = getImageProps({ ...common, ...HERO_MEDIA.tall });

  return (
    <div className={cn('overflow-hidden rounded-lg bg-bg-alt', className)}>
      <picture>
        <source media="(min-width: 48rem) and (max-width: 63.999rem)" srcSet={wide} />
        {/* A plain <img>: art direction needs <picture>; getImageProps supplies the optimized srcSet. */}
        <img
          {...tall}
          alt={HERO_MEDIA.alt}
          // The cap: the viewport less the header and the hero's lg top padding (spacing 16),
          // plus the same again below so the photo's foot stays in the first screen.
          className="block aspect-4/5 h-auto w-full animate-settle object-cover photo-tone motion-reduce:animate-none md:aspect-video lg:aspect-4/5 lg:max-h-[calc(100dvh-var(--header-offset)-var(--spacing)*32)]"
        />
      </picture>
    </div>
  );
}
