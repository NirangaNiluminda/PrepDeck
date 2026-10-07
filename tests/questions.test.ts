import { describe, it, expect, beforeEach } from 'vitest';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import {
  InMemoryQuestionRepository,
  InMemoryQuestionRevisionRepository,
  searchQuestions,
  createQuestion,
  getQuestion,
  publishQuestion,
  updateQuestion,
  archiveQuestion,
  restoreQuestion,
  listQuestionFacets,
  importQuestions,
  sampleQuestions,
  findSimilarQuestions,
  listQuestionRevisions,
  revertQuestion,
  type ImportQuestionItem,
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
  revisions: new InMemoryQuestionRevisionRepository(),
  clock: fixedClock('2026-01-15T10:00:00Z'),
  ids: sequentialIds('q'),
});

const validContent = () => ({
  stem: 'What is the difference between Terraform and Ansible?',
  type: 'short-answer' as const,
  difficulty: 'medium' as const,
  topicPath: 'devops/iac',
  tags: ['terraform', 'ansible'],
  answer: {
    modelAnswer: 'Terraform provisions infrastructure; Ansible configures it.',
    keyPoints: ['provisioning', 'configuration management', 'idempotent'],
  },
});

const validInput = (over: Partial<Parameters<typeof createQuestion>[0]> = {}) => ({
  ...validContent(),
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

  it('rejects a reference that is not an http(s) link, including javascript: URLs', async () => {
    for (const reference of ['see the RFC', 'javascript:alert(1)']) {
      const result = await createQuestion(
        validInput({ answer: { modelAnswer: 'An answer.', keyPoints: [], references: [reference] } }),
        deps(),
      );

      expect(!result.ok && result.error.message).toMatch(/http or https links/);
    }
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

  it('orders questions created in the same instant by id, so a list never reshuffles between reads', async () => {
    // deps() uses a fixed clock, so all three share one createdAt — a bulk import's situation.
    const ids = async (sort: 'oldest' | 'newest') =>
      (await searchQuestions({ sort, viewerIsAdmin: true }, d)).items.map((q) => q.id);

    const oldest = await ids('oldest');

    expect(oldest).toEqual([...oldest].sort());
    expect(await ids('newest')).toEqual([...oldest].reverse());
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

  it('names the correct MCQ option only when the answer is revealed', async () => {
    const d = deps();
    await createQuestion(
      validInput({
        type: 'mcq',
        options: [
          { id: 'a', text: 'Layer 4', correct: false },
          { id: 'b', text: 'Layer 7', correct: true },
        ],
      }),
      d,
    );
    const viewer = { id: 'q-1', viewerId: null, viewerIsAdmin: true };

    const shown = await getQuestion({ ...viewer, revealAnswer: true }, d);
    const hidden = await getQuestion({ ...viewer, revealAnswer: false }, d);

    expect(shown.ok && shown.value.answer?.correctOptionId).toBe('b');
    expect(hidden.ok && hidden.value.options).toEqual([
      { id: 'a', text: 'Layer 4' },
      { id: 'b', text: 'Layer 7' },
    ]);
    expect(hidden.ok && hidden.value.answer).toBeUndefined();
  });
});

describe('updateQuestion', () => {
  const edit = (over: Partial<Parameters<typeof updateQuestion>[0]> = {}) => ({
    ...validContent(),
    id: 'q-1',
    editorId: 'admin-1',
    editorIsAdmin: true,
    ...over,
  });

  it('requires moderator rights', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await updateQuestion(edit({ editorIsAdmin: false }), d);

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('enforces the same invariants as creation', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await updateQuestion(
      edit({ tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`) }),
      d,
    );

    expect(!result.ok && result.error.message).toMatch(/at most 10 tags/);
  });

  it('clears a field the new content leaves out', async () => {
    const d = deps();
    await createQuestion(
      validInput({ answer: { modelAnswer: 'Answer.', keyPoints: [], explanation: 'Why.' } }),
      d,
    );

    const result = await updateQuestion(
      edit({ answer: { modelAnswer: 'Answer.', keyPoints: [] } }),
      d,
    );

    expect(result.ok && result.value.answer?.explanation).toBeUndefined();
  });

  it('keeps its own wording without reporting a conflict', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await updateQuestion(edit({ difficulty: 'hard' }), d);

    expect(result.ok && result.value.difficulty).toBe('hard');
  });

  it("rejects wording that belongs to another question", async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await createQuestion(validInput({ stem: 'Explain what a Kubernetes pod is.' }), d);

    const result = await updateQuestion(edit({ id: 'q-2' }), d);

    expect(!result.ok && result.error.code).toBe('CONFLICT');
  });

  it('snapshots the pre-edit content as a revision', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    await updateQuestion(edit({ difficulty: 'hard' }), d);

    const revisions = await listQuestionRevisions({ questionId: 'q-1' }, d);
    expect(revisions).toHaveLength(1);
    expect(revisions[0].content.difficulty).toBe('medium');
    expect(revisions[0].editedBy).toBe('admin-1');
    expect(revisions[0].version).toBe(1);
  });
});

describe('revertQuestion', () => {
  it('restores an earlier revision as a new edit', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await updateQuestion(
      { ...validContent(), id: 'q-1', editorId: 'admin-1', editorIsAdmin: true, difficulty: 'hard' },
      d,
    );
    const [revision] = await listQuestionRevisions({ questionId: 'q-1' }, d);

    const result = await revertQuestion(
      { questionId: 'q-1', revisionId: revision.id, editorId: 'admin-1', editorIsAdmin: true },
      d,
    );

    expect(result.ok && result.value.difficulty).toBe('medium');
    // The revert is itself an edit, so it left its own trail behind it.
    expect(await listQuestionRevisions({ questionId: 'q-1' }, d)).toHaveLength(2);
  });

  it('requires moderator rights', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await updateQuestion(
      { ...validContent(), id: 'q-1', editorId: 'admin-1', editorIsAdmin: true, difficulty: 'hard' },
      d,
    );
    const [revision] = await listQuestionRevisions({ questionId: 'q-1' }, d);

    const result = await revertQuestion(
      { questionId: 'q-1', revisionId: revision.id, editorId: 'user-1', editorIsAdmin: false },
      d,
    );

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('reports not-found for an unknown revision', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await revertQuestion(
      { questionId: 'q-1', revisionId: 'no-such-revision', editorId: 'admin-1', editorIsAdmin: true },
      d,
    );

    expect(!result.ok && result.error.code).toBe('NOT_FOUND');
  });
});

describe('findSimilarQuestions', () => {
  it('surfaces near-duplicate wording above the similarity threshold', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const matches = await findSimilarQuestions(
      { stem: 'What is the difference between Terraform and Ansible, really?' },
      d,
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('q-1');
  });

  it('does not surface unrelated wording', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const matches = await findSimilarQuestions({ stem: 'Explain what a Kubernetes pod is.' }, d);

    expect(matches).toHaveLength(0);
  });
});

describe('archiveQuestion and restoreQuestion', () => {
  const moderator = { id: 'q-1', moderatorIsAdmin: true };

  it('hides an archived question from learners until it is restored and republished', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await publishQuestion({ id: 'q-1', moderatorId: 'a', moderatorIsAdmin: true }, d);

    await archiveQuestion(moderator, d);
    expect((await searchQuestions({ viewerIsAdmin: false }, d)).total).toBe(0);

    const restored = await restoreQuestion(moderator, d);
    expect(restored.ok && restored.value.status).toBe('draft');
  });

  it('refuses to archive twice or restore a question that is not archived', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const restoreDraft = await restoreQuestion(moderator, d);
    await archiveQuestion(moderator, d);
    const archiveAgain = await archiveQuestion(moderator, d);

    expect(!restoreDraft.ok && restoreDraft.error.code).toBe('VALIDATION');
    expect(!archiveAgain.ok && archiveAgain.error.code).toBe('VALIDATION');
  });

  it('requires moderator rights', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const result = await archiveQuestion({ id: 'q-1', moderatorIsAdmin: false }, d);

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });
});

describe('importQuestions', () => {
  const item = (over: Partial<ImportQuestionItem> = {}): ImportQuestionItem => ({
    ...validContent(),
    slug: 'terraform-vs-ansible',
    ...over,
  });
  const run = (
    d: ReturnType<typeof deps>,
    items: ImportQuestionItem[],
    options: { publish?: boolean; dryRun?: boolean } = {},
  ) =>
    importQuestions(
      { items, authorId: 'founder', publish: options.publish ?? false, dryRun: options.dryRun ?? false },
      d,
    );

  it('creates new slugs as drafts unless asked to publish', async () => {
    const d = deps();

    const drafts = await run(d, [item()]);
    const published = await run(d, [item({ slug: 'image-vs-container', stem: 'Docker image versus container?' })], {
      publish: true,
    });

    expect(drafts.outcomes).toEqual([{ slug: 'terraform-vs-ansible', kind: 'created', status: 'draft' }]);
    expect(published.outcomes[0]).toMatchObject({ kind: 'created', status: 'published' });
  });

  it('reports a second identical run as unchanged and writes nothing', async () => {
    const d = deps();
    await run(d, [item()], { publish: true });

    const again = await run(d, [item()], { publish: true });

    expect(again.outcomes).toEqual([{ slug: 'terraform-vs-ansible', kind: 'unchanged' }]);
    expect(again.written).toBe(false);
    expect((await d.questions.findBySlug('terraform-vs-ansible'))?.version).toBe(2);
    expect(d.questions.size).toBe(1);
  });

  it('updates in place and lists exactly the fields that changed', async () => {
    const d = deps();
    await run(d, [item()]);

    const edited = await run(d, [item({ difficulty: 'hard', tags: ['terraform'] })]);

    expect(edited.outcomes[0]).toEqual({
      slug: 'terraform-vs-ansible',
      kind: 'updated',
      changes: [
        { field: 'difficulty', before: 'medium', after: 'hard' },
        { field: 'tags', before: '["ansible","terraform"]', after: '["terraform"]' },
      ],
    });
    expect(d.questions.size).toBe(1);
  });

  it('saves nothing on a dry run but reports what would happen', async () => {
    const d = deps();

    const report = await run(d, [item()], { dryRun: true });

    expect(report.outcomes[0]).toMatchObject({ kind: 'created' });
    expect(report.written).toBe(false);
    expect(d.questions.size).toBe(0);
  });

  it('fails a bad item without stopping the rest', async () => {
    const d = deps();

    const report = await run(d, [
      item({ slug: 'too-short', stem: 'Too short' }),
      item(),
    ]);

    expect(report.outcomes.map((o) => o.kind)).toEqual(['failed', 'created']);
    expect(d.questions.size).toBe(1);
  });

  it('rejects a slug or wording repeated within one import, even on a dry run', async () => {
    const d = deps();

    const report = await run(
      d,
      [item(), item({ stem: 'A different question about Terraform.' }), item({ slug: 'copy' })],
      { dryRun: true },
    );

    expect(report.outcomes.map((o) => o.kind)).toEqual(['created', 'failed', 'failed']);
  });

  it('rejects wording that already belongs to a question created elsewhere', async () => {
    const d = deps();
    await createQuestion(validInput(), d);

    const report = await run(d, [item()]);

    expect(report.outcomes[0]).toMatchObject({ kind: 'failed', error: { code: 'CONFLICT' } });
  });

  it('leaves an archived question archived even when publishing', async () => {
    const d = deps();
    await run(d, [item()], { publish: true });
    const stored = await d.questions.findBySlug('terraform-vs-ansible');
    await archiveQuestion({ id: stored!.id, moderatorIsAdmin: true }, d);

    await run(d, [item({ difficulty: 'hard' })], { publish: true });

    expect((await d.questions.findBySlug('terraform-vs-ansible'))?.status).toBe('archived');
  });
});

describe('listQuestionFacets', () => {
  const seed = async () => {
    const d = deps();
    await createQuestion(validInput({ topicPath: 'devops/iac', tags: ['terraform', 'aws'] }), d);
    await createQuestion(
      validInput({ stem: 'Docker image versus container?', topicPath: 'devops/docker', tags: ['docker', 'aws'] }),
      d,
    );
    await createQuestion(
      validInput({ stem: 'Explain the CAP theorem.', topicPath: 'system-design', tags: ['cap'] }),
      d,
    );
    return d;
  };

  it('rolls topic counts up to their ancestors', async () => {
    const facets = await listQuestionFacets({ viewerIsAdmin: true }, await seed());

    expect(facets.topics.map((t) => [t.path, t.count])).toEqual([
      ['devops', 2],
      ['system-design', 1],
    ]);
    expect(facets.topics[0].children.map((t) => [t.path, t.count])).toEqual([
      ['devops/docker', 1],
      ['devops/iac', 1],
    ]);
  });

  it('lists the most-used tags first', async () => {
    const facets = await listQuestionFacets({ viewerIsAdmin: true }, await seed());

    expect(facets.tags[0]).toEqual({ tag: 'aws', count: 2 });
  });

  it('counts only published questions for learners', async () => {
    const d = await seed();
    await publishQuestion({ id: 'q-3', moderatorId: 'a', moderatorIsAdmin: true }, d);

    const facets = await listQuestionFacets({ viewerIsAdmin: false }, d);

    expect(facets.topics.map((t) => t.path)).toEqual(['system-design']);
  });
});

describe('searchQuestions (ids and difficulty sort)', () => {
  it('restricts to the given ids, and an empty list matches nothing', async () => {
    const d = deps();
    await createQuestion(validInput(), d);
    await createQuestion(validInput({ stem: 'Explain what a Kubernetes pod is.' }), d);

    const some = await searchQuestions({ ids: ['q-2'], viewerIsAdmin: true }, d);
    const none = await searchQuestions({ ids: [], viewerIsAdmin: true }, d);

    expect(some.items.map((q) => q.id)).toEqual(['q-2']);
    expect(none.total).toBe(0);
  });

  it('sorts hardest first by meaning, not alphabetically', async () => {
    const d = deps();
    for (const difficulty of ['medium', 'hard', 'easy'] as const) {
      await createQuestion(validInput({ stem: `A ${difficulty} question here.`, difficulty }), d);
    }

    const page = await searchQuestions({ sort: 'hardest', viewerIsAdmin: true }, d);

    expect(page.items.map((q) => q.difficulty)).toEqual(['hard', 'medium', 'easy']);
  });

  it('topicPaths matches any of several topics, as an OR', async () => {
    const d = deps();
    await createQuestion(validInput({ topicPath: 'devops/docker' }), d);
    await createQuestion(validInput({ stem: 'Explain the CAP theorem and why it matters.', topicPath: 'databases/distributed' }), d);
    await createQuestion(validInput({ stem: 'What is a race condition in concurrent code?', topicPath: 'security/web' }), d);

    const page = await searchQuestions(
      { topicPaths: ['devops', 'databases'], viewerIsAdmin: true },
      d,
    );

    expect(page.items.map((q) => q.topicPath).sort()).toEqual(['databases/distributed', 'devops/docker']);
  });
});

describe('sampleQuestions', () => {
  it('draws only from published questions, regardless of what a viewer could otherwise see', async () => {
    const d = deps();
    const draft = await createQuestion(validInput(), d);
    if (!draft.ok) throw new Error(draft.error.message);
    await createQuestion(validInput({ stem: 'A second, published question about Docker.' }), d).then((r) => {
      if (!r.ok) throw new Error(r.error.message);
      return publishQuestion({ id: r.value.id, moderatorId: 'admin', moderatorIsAdmin: true }, d);
    });

    const drawn = await sampleQuestions({ size: 10 }, d);

    expect(drawn).toHaveLength(1);
    expect(drawn[0].status).toBe('published');
    expect(drawn.some((q) => q.id === draft.value.id)).toBe(false);
  });

  it('includes the answer, unlike a search result', async () => {
    const d = deps();
    const created = await createQuestion(validInput(), d);
    if (!created.ok) throw new Error(created.error.message);
    await publishQuestion({ id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true }, d);

    const drawn = await sampleQuestions({ size: 10 }, d);

    expect(drawn[0].answer?.modelAnswer).toBeTruthy();
  });

  it('respects a topic filter', async () => {
    const d = deps();
    for (const topicPath of ['devops/docker', 'databases/indexing']) {
      const created = await createQuestion(validInput({ stem: `A published question about ${topicPath}.`, topicPath }), d);
      if (!created.ok) throw new Error(created.error.message);
      await publishQuestion({ id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true }, d);
    }

    const drawn = await sampleQuestions({ size: 10, topicPath: 'devops' }, d);

    expect(drawn).toHaveLength(1);
    expect(drawn[0].topicPath).toBe('devops/docker');
  });
});
