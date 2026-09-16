import { describe, it, expect, beforeEach } from 'vitest';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import {
  InMemoryQuestionRepository,
  searchQuestions,
  createQuestion,
  getQuestion,
  publishQuestion,
} from '@/modules/questions';

/**
 * THE TEST THAT PROVES THE ARCHITECTURE.
 *
 * Every use case runs here with no database, no Next.js, no network, in
 * milliseconds. If you ever have to spin up Mongo to test a use case, a
 * dependency has leaked past the port and the DB swap is no longer free.
 *
 * Run the identical suite against MongoQuestionRepository (via testcontainers)
 * as a separate contract test to confirm both adapters behave the same.
 */

const deps = () => ({
  questions: new InMemoryQuestionRepository(),
  clock: fixedClock('2026-01-15T10:00:00Z'),
  ids: sequentialIds('q'),
});

const validInput = (over: Partial<Parameters<typeof createQuestion>[0]> = {}) => ({
  stem: 'What is the difference between Terraform and Ansible?',
  type: 'short-answer' as const,
  difficulty: 'medium' as const,
  topicPath: 'devops/iac',
  tags: ['terraform', 'ansible'],
  answer: {
    modelAnswer: 'Terraform provisions infrastructure; Ansible configures it.',
    keyPoints: ['provisioning', 'configuration management', 'idempotent'],
  },
  authorId: 'user-1',
  ...over,
});

describe('createQuestion', () => {
  let d: ReturnType<typeof deps>;
  beforeEach(() => { d = deps(); });

  it('creates a draft with injected id and timestamp', async () => {
    const result = await createQuestion(validInput(), d);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe('q-1');
    expect(result.value.status).toBe('draft');
    expect(result.value.updatedAt).toBe('2026-01-15T10:00:00.000Z');
  });

  it('normalises tags to lowercase, deduped and sorted', async () => {
    const result = await createQuestion(
      validInput({ tags: ['Docker', 'docker', ' AWS '] }),
      d,
    );

    expect(result.ok && result.value.tags).toEqual(['aws', 'docker']);
  });

  it('rejects a stem that is too short', async () => {
    const result = await createQuestion(validInput({ stem: 'Too short' }), d);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('rejects an MCQ without exactly one correct option', async () => {
    const result = await createQuestion(
      validInput({
        type: 'mcq',
        options: [
          { id: 'a', text: 'Layer 4', correct: true },
          { id: 'b', text: 'Layer 7', correct: true },
        ],
      }),
      d,
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.message).toMatch(/exactly one/i);
  });

  it('rejects a duplicate stem', async () => {
    await createQuestion(validInput(), d);
    const second = await createQuestion(validInput(), d);

    expect(!second.ok && second.error.code).toBe('CONFLICT');
  });
});

describe('searchQuestions', () => {
  let d: ReturnType<typeof deps>;

  beforeEach(async () => {
    d = deps();
    await createQuestion(validInput({ topicPath: 'devops/iac' }), d);
    await createQuestion(
      validInput({
        stem: 'Explain the difference between a Docker image and a container.',
        topicPath: 'devops/docker',
        difficulty: 'easy',
        tags: ['docker'],
      }),
      d,
    );
    await createQuestion(
      validInput({
        stem: 'Explain the CAP theorem and why you cannot have all three.',
        topicPath: 'system-design/distributed',
        difficulty: 'hard',
        tags: ['cap'],
      }),
      d,
    );
  });

  it('hides unpublished questions from learners', async () => {
    const page = await searchQuestions({ viewerIsAdmin: false }, d);
    expect(page.total).toBe(0);
  });

  it('shows drafts to admins', async () => {
    const page = await searchQuestions({ viewerIsAdmin: true }, d);
    expect(page.total).toBe(3);
  });

  it('matches a parent topic and all its descendants', async () => {
    const page = await searchQuestions(
      { topicPath: 'devops', viewerIsAdmin: true },
      d,
    );
    expect(page.total).toBe(2);
  });

  it('filters by difficulty', async () => {
    const page = await searchQuestions(
      { difficulties: ['hard'], viewerIsAdmin: true },
      d,
    );
    expect(page.items.map((q) => q.topicPath)).toEqual(['system-design/distributed']);
  });

  it('applies AND semantics across tags', async () => {
    const both = await searchQuestions(
      { tags: ['terraform', 'ansible'], viewerIsAdmin: true },
      d,
    );
    const impossible = await searchQuestions(
      { tags: ['terraform', 'cap'], viewerIsAdmin: true },
      d,
    );

    expect(both.total).toBe(1);
    expect(impossible.total).toBe(0);
  });

  it('paginates while reporting the full total', async () => {
    const page = await searchQuestions(
      { page: { limit: 2, offset: 0 }, viewerIsAdmin: true },
      d,
    );

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(3);
  });
});

describe('publishQuestion', () => {
  it('requires moderator rights', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await publishQuestion(
      { id: 'q-1', moderatorId: 'user-2', moderatorIsAdmin: false },
      d,
    );

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('publishes and makes the question visible to learners', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await publishQuestion({ id: 'q-1', moderatorId: 'admin', moderatorIsAdmin: true }, d);

    const page = await searchQuestions({ viewerIsAdmin: false }, d);
    expect(page.total).toBe(1);
  });

  it('bumps the version on every transition', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    const published = await publishQuestion(
      { id: 'q-1', moderatorId: 'admin', moderatorIsAdmin: true },
      d,
    );

    expect(published.ok).toBe(true);
    const stored = await d.questions.findById('q-1');
    expect(stored?.version).toBe(2);
  });
});

describe('getQuestion', () => {
  it('withholds the answer when reveal is false', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await publishQuestion({ id: 'q-1', moderatorId: 'a', moderatorIsAdmin: true }, d);

    const hidden = await getQuestion(
      { id: 'q-1', viewerId: 'user-9', viewerIsAdmin: false, revealAnswer: false },
      d,
    );
    const shown = await getQuestion(
      { id: 'q-1', viewerId: 'user-9', viewerIsAdmin: false, revealAnswer: true },
      d,
    );

    expect(hidden.ok && hidden.value.answer).toBeUndefined();
    expect(shown.ok && shown.value.answer?.keyPoints).toHaveLength(3);
  });

  it('returns NOT_FOUND for an unknown id', async () => {
    const result = await getQuestion(
      { id: 'nope', viewerId: null, viewerIsAdmin: false, revealAnswer: true },
      deps(),
    );

    expect(!result.ok && result.error.code).toBe('NOT_FOUND');
  });
});
