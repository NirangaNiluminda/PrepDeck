import { describe, it, expect } from 'vitest';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import { InMemoryQuestionRepository, createQuestion, publishQuestion } from '@/modules/questions';
import { InMemoryBookmarkRepository, listBookmarkedQuestionIds, setBookmark } from '@/modules/bookmarks';
import { InMemoryNoteRepository, getNote, setNote } from '@/modules/notes';
import {
  InMemoryAttemptRepository,
  InMemoryReviewCardRepository,
  getProgress,
  recordAttempt,
  sm2Scheduler,
} from '@/modules/practice';
import { InMemoryExamSessionRepository, getExamResults, listExamHistory, startExam, submitExam } from '@/modules/exams';

/**
 * PROJECT_PLAN.md's own risk register, made executable: "Add an integration
 * test that seeds two users and asserts isolation." Stage 4's multi-user work
 * starts here — before adding real accounts, prove the single-user version
 * of every module already keeps one person's data away from another's. Every
 * one of these passed before Stage 4 touched anything; this test exists so
 * that stays true as the codebase grows.
 */

const NOW = fixedClock('2026-01-15T10:00:00Z');
const questionIds = sequentialIds('q');
const attemptIds = sequentialIds('attempt');
const examIds = sequentialIds('exam');

async function buildWorld() {
  const questions = new InMemoryQuestionRepository();
  const bookmarks = new InMemoryBookmarkRepository();
  const notes = new InMemoryNoteRepository();
  const reviewCards = new InMemoryReviewCardRepository();
  const attempts = new InMemoryAttemptRepository();
  const examSessions = new InMemoryExamSessionRepository();

  const created = await createQuestion(
    {
      stem: 'What is the difference between TCP and UDP at the transport layer?',
      type: 'mcq',
      difficulty: 'medium',
      topicPath: 'web/networking',
      tags: [],
      answer: { modelAnswer: 'TCP is reliable and ordered; UDP is not.', keyPoints: [] },
      options: [
        { id: 'a', text: 'TCP', correct: true },
        { id: 'b', text: 'UDP', correct: false },
      ],
      authorId: 'author-1',
    },
    { questions, clock: NOW, ids: questionIds },
  );
  if (!created.ok) throw new Error(created.error.message);
  const published = await publishQuestion(
    { id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true },
    { questions, clock: NOW },
  );
  if (!published.ok) throw new Error(published.error.message);

  return { questions, bookmarks, notes, reviewCards, attempts, examSessions, questionId: created.value.id };
}

describe('cross-module user isolation', () => {
  it("never lets Alice's bookmark, note, practice history or exam show up for Bob", async () => {
    const w = await buildWorld();

    // Alice bookmarks, notes, reviews and exams the same question.
    await setBookmark({ userId: 'alice', questionId: w.questionId, bookmarked: true }, { bookmarks: w.bookmarks, clock: NOW });
    await setNote({ userId: 'alice', questionId: w.questionId, content: "Alice's private rewording." }, { notes: w.notes, clock: NOW });
    await recordAttempt(
      { userId: 'alice', questionId: w.questionId, rating: 'good', timeTakenMs: 1000 },
      { reviewCards: w.reviewCards, attempts: w.attempts, scheduler: sm2Scheduler, clock: NOW, ids: attemptIds },
    );
    const aliceExam = await startExam(
      { userId: 'alice', count: 1, durationMinutes: 30 },
      { questions: w.questions, examSessions: w.examSessions, clock: NOW, ids: examIds },
    );
    if (!aliceExam.ok) throw new Error(aliceExam.error.message);
    await submitExam({ examSessionId: aliceExam.value.id, userId: 'alice' }, { examSessions: w.examSessions, clock: NOW });

    // Bob touches nothing.

    const [bobBookmarks, bobNote, bobProgress, bobHistory] = await Promise.all([
      listBookmarkedQuestionIds({ userId: 'bob' }, { bookmarks: w.bookmarks }),
      getNote({ userId: 'bob', questionId: w.questionId }, { notes: w.notes }),
      getProgress({ userId: 'bob', now: NOW.now() }, { reviewCards: w.reviewCards, attempts: w.attempts, questions: w.questions }),
      listExamHistory({ userId: 'bob' }, { examSessions: w.examSessions }),
    ]);

    expect(bobBookmarks).toEqual([]);
    expect(bobNote).toBe('');
    expect(bobProgress).toEqual({ streak: 0, cardsDue: 0, totalReviewed: 0, topics: [] });
    expect(bobHistory).toEqual([]);

    // And Bob can't reach Alice's exam by id, even knowing it.
    const bobReadsAlicesExam = await getExamResults({ examSessionId: aliceExam.value.id, userId: 'bob' }, { examSessions: w.examSessions });
    expect(!bobReadsAlicesExam.ok && bobReadsAlicesExam.error.code).toBe('NOT_FOUND');

    // Confirm none of this was a no-op — Alice's own reads see everything.
    const [aliceBookmarks, aliceNote, aliceProgress, aliceHistory] = await Promise.all([
      listBookmarkedQuestionIds({ userId: 'alice' }, { bookmarks: w.bookmarks }),
      getNote({ userId: 'alice', questionId: w.questionId }, { notes: w.notes }),
      getProgress({ userId: 'alice', now: NOW.now() }, { reviewCards: w.reviewCards, attempts: w.attempts, questions: w.questions }),
      listExamHistory({ userId: 'alice' }, { examSessions: w.examSessions }),
    ]);
    expect(aliceBookmarks).toEqual([w.questionId]);
    expect(aliceNote).toBe("Alice's private rewording.");
    expect(aliceProgress.totalReviewed).toBe(1);
    expect(aliceHistory).toHaveLength(1);
  });

  it('lets both users bookmark, note and review the very same question independently', async () => {
    const w = await buildWorld();

    await setBookmark({ userId: 'alice', questionId: w.questionId, bookmarked: true }, { bookmarks: w.bookmarks, clock: NOW });
    await setBookmark({ userId: 'bob', questionId: w.questionId, bookmarked: true }, { bookmarks: w.bookmarks, clock: NOW });
    await setNote({ userId: 'alice', questionId: w.questionId, content: 'Alice.' }, { notes: w.notes, clock: NOW });
    await setNote({ userId: 'bob', questionId: w.questionId, content: 'Bob.' }, { notes: w.notes, clock: NOW });
    await recordAttempt(
      { userId: 'alice', questionId: w.questionId, rating: 'again', timeTakenMs: 0 },
      { reviewCards: w.reviewCards, attempts: w.attempts, scheduler: sm2Scheduler, clock: NOW, ids: attemptIds },
    );
    await recordAttempt(
      { userId: 'bob', questionId: w.questionId, rating: 'easy', timeTakenMs: 0 },
      { reviewCards: w.reviewCards, attempts: w.attempts, scheduler: sm2Scheduler, clock: NOW, ids: attemptIds },
    );

    expect(await listBookmarkedQuestionIds({ userId: 'alice' }, { bookmarks: w.bookmarks })).toEqual([w.questionId]);
    expect(await listBookmarkedQuestionIds({ userId: 'bob' }, { bookmarks: w.bookmarks })).toEqual([w.questionId]);
    expect(await getNote({ userId: 'alice', questionId: w.questionId }, { notes: w.notes })).toBe('Alice.');
    expect(await getNote({ userId: 'bob', questionId: w.questionId }, { notes: w.notes })).toBe('Bob.');

    // Same question, two independent review schedules — 'again' vs 'easy' diverge.
    const aliceCard = await w.reviewCards.findByUserAndQuestion('alice', w.questionId);
    const bobCard = await w.reviewCards.findByUserAndQuestion('bob', w.questionId);
    expect(aliceCard?.interval).toBe(1);
    expect(bobCard?.interval).toBe(4);
  });

  it('removing a bookmark or note only ever touches the caller\'s own row', async () => {
    const w = await buildWorld();
    await setBookmark({ userId: 'alice', questionId: w.questionId, bookmarked: true }, { bookmarks: w.bookmarks, clock: NOW });
    await setBookmark({ userId: 'bob', questionId: w.questionId, bookmarked: true }, { bookmarks: w.bookmarks, clock: NOW });

    await setBookmark({ userId: 'alice', questionId: w.questionId, bookmarked: false }, { bookmarks: w.bookmarks, clock: NOW });

    expect(await listBookmarkedQuestionIds({ userId: 'alice' }, { bookmarks: w.bookmarks })).toEqual([]);
    expect(await listBookmarkedQuestionIds({ userId: 'bob' }, { bookmarks: w.bookmarks })).toEqual([w.questionId]);
  });
});
