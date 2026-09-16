import { type Result, ok, err, validationError } from '@/shared/result';

/**
 * Hierarchical topic, stored as a normalised slug path:
 *   "devops/docker/networking"
 *
 * Storing the full path (rather than a parentId chain) means "all questions
 * under devops" is a cheap prefix match in any database — no recursive CTE,
 * no $graphLookup. That portability is the whole point.
 */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_DEPTH = 4;

export class TopicPath {
  private constructor(readonly value: string) {}

  static create(raw: string): Result<TopicPath> {
    const segments = raw.trim().toLowerCase().split('/').filter(Boolean);

    if (segments.length === 0) {
      return err(validationError('Topic path cannot be empty'));
    }
    if (segments.length > MAX_DEPTH) {
      return err(validationError(`Topic path may not exceed ${MAX_DEPTH} levels`));
    }
    const bad = segments.filter((s) => !SEGMENT.test(s));
    if (bad.length > 0) {
      return err(
        validationError('Topic segments must be lowercase slugs', {
          topicPath: bad,
        }),
      );
    }
    return ok(new TopicPath(segments.join('/')));
  }

  get segments(): string[] {
    return this.value.split('/');
  }

  get depth(): number {
    return this.segments.length;
  }

  get root(): string {
    return this.segments[0];
  }

  /** True for itself and any descendant: devops/docker isUnder devops. */
  isUnder(ancestor: TopicPath): boolean {
    return this.value === ancestor.value || this.value.startsWith(`${ancestor.value}/`);
  }

  equals(other: TopicPath): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
