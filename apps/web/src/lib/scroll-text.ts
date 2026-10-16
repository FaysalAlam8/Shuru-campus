import { scrollText } from '@/styles/motion';

/**
 * A run of text, optionally emphasized (`<em>`) or marked as a keyword (`<strong>`), as a
 * statement is written. Runs join exactly as written, so put whitespace where words break: a run
 * that ends mid-word ("head-start" then ": a…") stays one word with the next.
 */
export interface ScrollTextPart {
  text: string;
  em?: boolean;
  strong?: boolean;
}

/** One styled stretch of a word. */
export interface ScrollRun {
  text: string;
  em: boolean;
  strong: boolean;
}

export interface ScrollWord {
  /** The word as it reads. */
  word: string;
  /** Its styled runs, usually one ("head-start:" is two: the keyword, then the colon). */
  runs: ScrollRun[];
  /** Where on the statement's `cover` timeline this word starts and finishes brightening (%). */
  from: number;
  to: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Splits a statement into words, each with its own stretch of the statement's scroll: they
 * brighten in reading order between `scrollText.start` and `scrollText.end`, each taking
 * `spread` words' worth, so the brightening runs along the line rather than a line at a time.
 */
export function scrollWords(parts: readonly ScrollTextPart[]): ScrollWord[] {
  const words: ScrollRun[][] = [];
  // Whether the next piece of text continues the last word (no whitespace since it).
  let inWord = false;
  for (const { text, em = false, strong = false } of parts) {
    for (const piece of text.split(/(\s+)/)) {
      if (piece === '') continue;
      if (/^\s+$/.test(piece)) {
        inWord = false;
        continue;
      }
      const run = { text: piece, em, strong };
      const last = words.at(-1);
      if (inWord && last) last.push(run);
      else words.push([run]);
      inWord = true;
    }
  }
  const step = (scrollText.end - scrollText.start) / Math.max(words.length, 1);

  return words.map((runs, i) => {
    const from = scrollText.start + i * step;
    return {
      word: runs.map((r) => r.text).join(''),
      runs,
      from: round(from),
      to: round(Math.min(scrollText.end, from + step * scrollText.spread)),
    };
  });
}

/**
 * Reads keyword markup in authored copy: `**…**` marks a keyword (`strong`), the rest is plain.
 * "with a **head-start**: a…" → ["with a ", "head-start" (strong), ": a…"].
 */
export function keywordParts(copy: string): ScrollTextPart[] {
  return copy
    .split(/\*\*(.+?)\*\*/)
    .flatMap((text, i) => (text ? [i % 2 === 1 ? { text, strong: true } : { text }] : []));
}
