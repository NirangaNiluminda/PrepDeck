/**
 * Fuzzy duplicate detection for community submissions (exact-match dedupe is
 * `existsWithStem`). No embedding model in the stack, so this is the classic
 * trigram/Dice-coefficient approach `pg_trgm` uses — pure and dependency-free,
 * same spirit as day-boundary.ts doing timezone math without a date library.
 */
const trigrams = (text: string): Set<string> => {
  // Padded so short stems ("What is TLS?") still produce a few grams instead
  // of none, and word boundaries count towards the match.
  const s = ` ${text.toLowerCase().trim().replace(/\s+/g, ' ')} `;
  const grams = new Set<string>();
  for (let i = 0; i <= s.length - 3; i++) grams.add(s.slice(i, i + 3));
  return grams;
};

/** Dice coefficient over character trigrams, 0 (nothing shared) to 1 (identical). */
export function stemSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;

  let shared = 0;
  for (const gram of ta) {
    if (tb.has(gram)) shared += 1;
  }
  return (2 * shared) / (ta.size + tb.size);
}

/** Surfaced as "similar to…" above this score; below it, wording overlap is coincidental. */
export const SIMILARITY_THRESHOLD = 0.4;

export interface SimilarityCandidate {
  readonly id: string;
  readonly stem: string;
}

export interface SimilarStem {
  readonly id: string;
  readonly similarity: number;
}

/** Highest similarity first, capped at `limit`, filtered to the threshold. */
export function findMostSimilar(
  stem: string,
  candidates: readonly SimilarityCandidate[],
  limit: number,
): SimilarStem[] {
  return candidates
    .map((c) => ({ id: c.id, similarity: stemSimilarity(stem, c.stem) }))
    .filter((c) => c.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
