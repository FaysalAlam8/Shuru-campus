import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface PageIntroProps {
  /** The section label above the title ("Spaces & pricing"). */
  eyebrow: string;
  /** The page's `h1`, with at most one `<em>` (B2). */
  title: ReactNode;
  /** The `h1`'s id, for a surrounding `aria-labelledby`. */
  titleId?: string;
  /** The supporting paragraph. */
  lead?: ReactNode;
  /** Anything that follows the lead in the right column (a date, a sub-nav). */
  children?: ReactNode;
  className?: string;
}

/**
 * A page's opening `header`. Stacked below `lg`; from `lg` the eyebrow and title take the left
 * and the lead the right, its last line level with the title's, so the intro spans the page
 * instead of leaving its right half empty.
 */
export function PageIntro({ eyebrow, title, titleId, lead, children, className }: PageIntroProps) {
  return (
    <header className={cn('lg:grid lg:grid-cols-12 lg:items-end lg:gap-gutter', className)}>
      <div className="lg:col-span-7">
        <p className="type-eyebrow text-fg-subtle">{eyebrow}</p>
        {/* 20ch: the display measure (B1). */}
        <h1 id={titleId} className="mt-4 max-w-[20ch] type-h1 text-balance text-fg">
          {title}
        </h1>
      </div>
      {lead || children ? (
        <div className="mt-6 lg:col-span-5 lg:mt-0">
          {lead ? <p className="max-w-2xl type-lead text-pretty text-fg-muted">{lead}</p> : null}
          {children}
        </div>
      ) : null}
    </header>
  );
}
