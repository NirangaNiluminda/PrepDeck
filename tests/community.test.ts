import { describe, it, expect, beforeEach } from 'vitest';
import type { Clock } from '@/shared/ports';
import { InMemoryRateLimiter } from '@/shared/rate-limiter';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import { InMemoryQuestionRepository, createQuestion, publishQuestion, type QuestionContent } from '@/modules/questions';
import {
  InMemorySubmissionRepository,
  InMemoryVoteRepository,
  InMemoryReportRepository,
  submitQuestion,
  resubmitQuestion,
  getSubmission,
  listSubmissions,
  listMySubmissions,
  moderateSubmission,
  castVote,
  getVoteSummary,
  recommendQuestions,
  reportQuestion,
  listReports,
  resolveReport,
} from '@/modules/community';

/**
 * The whole community flow — submit, moderate, vote, report, recommend — run
 * against in-memory adapters, no database. Submission's own state-machine
 * rules are exercised through the use cases here rather than a separate
 * zero-I/O domain test file, since every transition already needs a use case
 * to reach it (unlike Question, nothing else in this module calls the
 * entity's methods directly).
 */

const buildDeps = () => ({
  questions: new InMemoryQuestionRepository(),
  submissions: new InMemorySubmissionRepository(),
  votes: new InMemoryVoteRepository(),
  reports: new InMemoryReportRepository(),
  rateLimiter: new InMemoryRateLimiter(fixedClock('2026-02-01T10:00:00Z')),
  clock: fixedClock('2026-02-01T10:00:00Z') as Clock,
  ids: sequentialIds('c'),
});
type Deps = ReturnType<typeof buildDeps>;

const validContent = (over: Partial<QuestionContent> = {}): QuestionContent => ({
  stem: 'What is the difference between Terraform and Ansible?',
  type: 'short-answer',
  difficulty: 'medium',
  topicPath: 'devops/iac',
  tags: ['terraform', 'ansible'],
  answer: {
    modelAnswer: 'Terraform provisions infrastructure; Ansible configures it.',
    keyPoints: ['provisioning', 'configuration management'],
  },
  ...over,
});

describe('submitQuestion', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('creates a pending submission', async () => {
    const result = await submitQuestion({ authorId: 'alice', content: validContent() }, d);

    expect(result.ok && result.value.status).toBe('pending');
    expect(result.ok && result.value.authorId).toBe('alice');
  });

  it('rejects invalid content the same way createQuestion would', async () => {
    const result = await submitQuestion({ authorId: 'alice', content: validContent({ stem: 'Too short' }) }, d);

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('flags near-duplicate wording against an existing published question', async () => {
    await createQuestion({ ...validContent(), authorId: 'admin' }, d);

    const result = await submitQuestion(
      { authorId: 'alice', content: validContent({ stem: 'What is the difference between Terraform and Ansible, exactly?' }) },
      d,
    );

    expect(result.ok && result.value.possibleDuplicates.length).toBeGreaterThan(0);
  });

  it('rate limits repeated submissions from the same author', async () => {
    for (let i = 0; i < 10; i++) {
      await submitQuestion({ authorId: 'alice', content: validContent({ stem: `Question number ${i} about DevOps tooling?` }) }, d);
    }

    const result = await submitQuestion({ authorId: 'alice', content: validContent({ stem: 'One question too many about DevOps?' }) }, d);

    expect(!result.ok && result.error.code).toBe('RATE_LIMITED');
  });
});

describe('resubmitQuestion', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  const submitAndRequestChanges = async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');
    await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'changes-requested', note: 'Add a reference.', reviewerId: 'admin', reviewerIsAdmin: true },
      d,
    );
    return submitted.value.id;
  };

  it('moves a revised submission back to pending', async () => {
    const id = await submitAndRequestChanges();

    const result = await resubmitQuestion(
      { submissionId: id, authorId: 'alice', content: validContent({ difficulty: 'hard' }) },
      d,
    );

    expect(result.ok && result.value.status).toBe('pending');
  });

  it('rejects a resubmit from someone other than the author', async () => {
    const id = await submitAndRequestChanges();

    const result = await resubmitQuestion({ submissionId: id, authorId: 'mallory', content: validContent() }, d);

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('rejects a resubmit while still pending', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await resubmitQuestion({ submissionId: submitted.value.id, authorId: 'alice', content: validContent() }, d);

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });
});

describe('getSubmission', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it("is visible to its own author", async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await getSubmission({ id: submitted.value.id, viewerId: 'alice', viewerIsAdmin: false }, d);

    expect(result.ok).toBe(true);
  });

  it('is hidden from anyone else', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await getSubmission({ id: submitted.value.id, viewerId: 'mallory', viewerIsAdmin: false }, d);

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('is visible to a moderator', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await getSubmission({ id: submitted.value.id, viewerId: 'admin', viewerIsAdmin: true }, d);

    expect(result.ok).toBe(true);
  });
});

describe('listSubmissions', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('is admin-only', async () => {
    const result = await listSubmissions({ viewerIsAdmin: false }, d);
    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('defaults to pending submissions', async () => {
    await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    const submitted = await submitQuestion({ authorId: 'bob', content: validContent({ stem: 'Explain what a Kubernetes pod is.' }) }, d);
    if (submitted.ok) {
      await moderateSubmission({ submissionId: submitted.value.id, decision: 'rejected', reviewerId: 'admin', reviewerIsAdmin: true }, d);
    }

    const result = await listSubmissions({ viewerIsAdmin: true }, d);

    expect(result.ok && result.value.items).toHaveLength(1);
  });
});

describe('listMySubmissions', () => {
  it('only ever returns the caller\'s own submissions', async () => {
    const d = buildDeps();
    await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    await submitQuestion({ authorId: 'bob', content: validContent({ stem: 'Explain what a Kubernetes pod is.' }) }, d);

    const mine = await listMySubmissions({ authorId: 'alice' }, d);

    expect(mine).toHaveLength(1);
    expect(mine[0].authorId).toBe('alice');
  });
});

describe('moderateSubmission', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('requires moderator rights', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'approved', reviewerId: 'alice', reviewerIsAdmin: false },
      d,
    );

    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('approving creates and publishes a Question, and records the resulting id', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'approved', reviewerId: 'admin', reviewerIsAdmin: true },
      d,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('approved');
    expect(result.value.questionId).toBeDefined();

    const created = await d.questions.findById(result.value.questionId!);
    expect(created?.status).toBe('published');
    expect(created?.authorId).toBe('alice');
  });

  it('rejecting requires no note but records one if given', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'rejected', note: 'Not interview-relevant.', reviewerId: 'admin', reviewerIsAdmin: true },
      d,
    );

    expect(result.ok && result.value.status).toBe('rejected');
    expect(result.ok && result.value.history.at(-1)?.note).toBe('Not interview-relevant.');
  });

  it('requesting changes requires a note', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');

    const result = await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'changes-requested', reviewerId: 'admin', reviewerIsAdmin: true },
      d,
    );

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('cannot moderate a submission twice', async () => {
    const submitted = await submitQuestion({ authorId: 'alice', content: validContent() }, d);
    if (!submitted.ok) throw new Error('setup failed');
    await moderateSubmission({ submissionId: submitted.value.id, decision: 'rejected', reviewerId: 'admin', reviewerIsAdmin: true }, d);

    const result = await moderateSubmission(
      { submissionId: submitted.value.id, decision: 'approved', reviewerId: 'admin', reviewerIsAdmin: true },
      d,
    );

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });
});

describe('castVote', () => {
  let d: Deps;
  let questionId: string;
  beforeEach(async () => {
    d = buildDeps();
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    questionId = created.ok ? created.value.id : '';
    await publishQuestion({ id: questionId, moderatorId: 'admin', moderatorIsAdmin: true }, d);
  });

  it('rejects voting on a question that is not published', async () => {
    const draftCreated = await createQuestion({ ...validContent({ stem: 'A separate draft question here.' }), authorId: 'admin' }, d);
    const draftId = draftCreated.ok ? draftCreated.value.id : '';

    const result = await castVote({ userId: 'alice', questionId: draftId, direction: 1 }, d);

    expect(!result.ok && result.error.code).toBe('NOT_FOUND');
  });

  it('records an up vote and tallies it', async () => {
    const result = await castVote({ userId: 'alice', questionId, direction: 1 }, d);

    expect(result.ok && result.value.tally).toEqual({ questionId, up: 1, down: 0, score: 1 });
    expect(result.ok && result.value.viewerDirection).toBe(1);
  });

  it('a second vote from the same user replaces, not adds', async () => {
    await castVote({ userId: 'alice', questionId, direction: 1 }, d);
    const result = await castVote({ userId: 'alice', questionId, direction: -1 }, d);

    expect(result.ok && result.value.tally).toEqual({ questionId, up: 0, down: 1, score: -1 });
  });

  it('direction 0 removes the vote', async () => {
    await castVote({ userId: 'alice', questionId, direction: 1 }, d);
    const result = await castVote({ userId: 'alice', questionId, direction: 0 }, d);

    expect(result.ok && result.value.tally).toEqual({ questionId, up: 0, down: 0, score: 0 });
    expect(result.ok && result.value.viewerDirection).toBeNull();
  });

  it('rate limits rapid voting from the same user', async () => {
    for (let i = 0; i < 30; i++) {
      await castVote({ userId: 'alice', questionId, direction: i % 2 === 0 ? 1 : -1 }, d);
    }

    const result = await castVote({ userId: 'alice', questionId, direction: 1 }, d);

    expect(!result.ok && result.error.code).toBe('RATE_LIMITED');
  });
});

describe('getVoteSummary', () => {
  it('reports no vote for a viewer who has not voted', async () => {
    const d = buildDeps();
    const summary = await getVoteSummary({ questionId: 'q-1', viewerId: 'alice' }, d);

    expect(summary).toEqual({ tally: { questionId: 'q-1', up: 0, down: 0, score: 0 }, viewerDirection: null });
  });

  it("reflects the viewer's own vote and the overall tally", async () => {
    const d = buildDeps();
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';
    await publishQuestion({ id: questionId, moderatorId: 'admin', moderatorIsAdmin: true }, d);
    await castVote({ userId: 'alice', questionId, direction: 1 }, d);
    await castVote({ userId: 'bob', questionId, direction: 1 }, d);

    const summary = await getVoteSummary({ questionId, viewerId: 'alice' }, d);

    expect(summary.tally.score).toBe(2);
    expect(summary.viewerDirection).toBe(1);
  });
});

describe('recommendQuestions', () => {
  it('returns nothing for a topic with no votes', async () => {
    const d = buildDeps();
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    if (created.ok) await publishQuestion({ id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true }, d);

    const result = await recommendQuestions({ topicPaths: ['devops'] }, d);

    expect(result).toEqual([]);
  });

  it('surfaces only positively-scored questions, highest first', async () => {
    const d = buildDeps();
    const a = await createQuestion({ ...validContent({ stem: 'Question A about Terraform state.' }), authorId: 'admin' }, d);
    const b = await createQuestion({ ...validContent({ stem: 'Question B about Ansible playbooks.' }), authorId: 'admin' }, d);
    const c = await createQuestion({ ...validContent({ stem: 'Question C about Docker networking.' }), authorId: 'admin' }, d);
    const idA = a.ok ? a.value.id : '';
    const idB = b.ok ? b.value.id : '';
    const idC = c.ok ? c.value.id : '';
    for (const id of [idA, idB, idC]) {
      await publishQuestion({ id, moderatorId: 'admin', moderatorIsAdmin: true }, d);
    }

    await castVote({ userId: 'u1', questionId: idA, direction: 1 }, d);
    await castVote({ userId: 'u2', questionId: idA, direction: 1 }, d);
    await castVote({ userId: 'u1', questionId: idB, direction: 1 }, d);
    await castVote({ userId: 'u1', questionId: idC, direction: -1 }, d);

    const result = await recommendQuestions({ topicPaths: ['devops'] }, d);

    expect(result.map((r) => r.id)).toEqual([idA, idB]);
  });
});

describe('reportQuestion', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('records an open report', async () => {
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';

    const result = await reportQuestion({ reporterId: 'alice', questionId, reason: 'incorrect', note: 'The answer is wrong.' }, d);

    expect(result.ok && result.value.status).toBe('open');
  });

  it('rejects an unknown reason', async () => {
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';

    const result = await reportQuestion({ reporterId: 'alice', questionId, reason: 'not-a-real-reason' }, d);

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('rate limits repeated reports from the same user', async () => {
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';
    for (let i = 0; i < 10; i++) {
      await reportQuestion({ reporterId: 'alice', questionId, reason: 'other' }, d);
    }

    const result = await reportQuestion({ reporterId: 'alice', questionId, reason: 'other' }, d);

    expect(!result.ok && result.error.code).toBe('RATE_LIMITED');
  });
});

describe('listReports and resolveReport', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('listReports is admin-only', async () => {
    const result = await listReports({ viewerIsAdmin: false }, d);
    expect(!result.ok && result.error.code).toBe('FORBIDDEN');
  });

  it('resolves an open report', async () => {
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';
    const report = await reportQuestion({ reporterId: 'alice', questionId, reason: 'offensive' }, d);
    if (!report.ok) throw new Error('setup failed');

    const result = await resolveReport({ reportId: report.value.id, outcome: 'dismissed', resolverId: 'admin', resolverIsAdmin: true }, d);

    expect(result.ok && result.value.status).toBe('dismissed');
    const openReports = await listReports({ viewerIsAdmin: true }, d);
    expect(openReports.ok && openReports.value.items).toHaveLength(0);
  });

  it('cannot resolve the same report twice', async () => {
    const created = await createQuestion({ ...validContent(), authorId: 'admin' }, d);
    const questionId = created.ok ? created.value.id : '';
    const report = await reportQuestion({ reporterId: 'alice', questionId, reason: 'offensive' }, d);
    if (!report.ok) throw new Error('setup failed');
    await resolveReport({ reportId: report.value.id, outcome: 'dismissed', resolverId: 'admin', resolverIsAdmin: true }, d);

    const result = await resolveReport({ reportId: report.value.id, outcome: 'resolved', resolverId: 'admin', resolverIsAdmin: true }, d);

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });
});
