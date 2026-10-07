import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getContainer, type Container } from '@/composition/container';
import { listBookmarkedQuestionIds } from '@/modules/bookmarks';
import { getQuestion, searchQuestions } from '@/modules/questions';
import { getNote } from '@/modules/notes';
import { getVoteSummary } from '@/modules/community';
import { AnswerBody } from '../../_components/answer-body';
import { AnswerReveal } from '../../_components/answer-reveal';
import { DifficultyBadge, Kbd, StatusBadge, TagLink, TopicChip, TopicTrail } from '../../_components/badges';
import { BookmarkButton } from '../../_components/bookmark-button';
import { KeyLinks } from '../../_components/key-links';
import { InlineMarkdown, Markdown } from '../../_components/markdown';
import { ModerationActions } from '../../_components/moderation-actions';
import { NoteEditor } from '../../_components/note-editor';
import { ReportButton } from '../../_components/report-button';
import { VoteButtons } from '../../_components/vote-buttons';
import { type BrowseParams, browseHref, parseBrowseParams } from '../../_lib/browse-params';
import { browseSearchInput } from '../../_lib/browse-query';
import { TYPE_LABELS, topicLabel, topicStyle } from '../../_lib/labels';
import { getViewer } from '../../_lib/viewer';

// generateMetadata and the page both need the question; cache() makes that a
// single database read per request.
const loadQuestion = cache(async (id: string) => {
  const viewer = await getViewer();
  const container = await getContainer();
  const result = await getQuestion(
    { id, viewerId: viewer?.userId ?? null, viewerIsAdmin: viewer?.role === 'admin', revealAnswer: true },
    container,
  );
  return { viewer, container, question: result.ok ? result.value : null };
});

export async function generateMetadata(props: PageProps<'/questions/[id]'>): Promise<Metadata> {
  const { id } = await props.params;
  const { question } = await loadQuestion(id);
  if (!question) return { title: 'Not found' };
  const plain = question.stem.replace(/[`*_]/g, '').replace(/\s+/g, ' ');
  return { title: plain.length > 70 ? `${plain.slice(0, 67)}...` : plain };
}

// Previous/next look this far into the reader's list. Past it the buttons
// just don't show, which beats paging through the whole corpus per view.
const NEIGHBOUR_WINDOW = 100;

export default async function QuestionPage(props: PageProps<'/questions/[id]'>) {
  const [{ id }, search] = await Promise.all([props.params, props.searchParams]);
  const { viewer, container, question } = await loadQuestion(id);

  // Not-published and missing look the same to a learner, so a draft's
  // existence isn't revealed by a different error.
  if (!question) notFound();

  const isAdmin = viewer?.role === 'admin';
  const params = parseBrowseParams(search);
  const bookmarkedIds = viewer ? await listBookmarkedQuestionIds({ userId: viewer.userId }, container) : null;
  const [note, voteSummary, neighbours] = await Promise.all([
    viewer ? getNote({ userId: viewer.userId, questionId: question.id }, container) : Promise.resolve(''),
    getVoteSummary({ questionId: question.id, viewerId: viewer?.userId ?? null }, container),
    findNeighbours(question.id, params, { isAdmin, bookmarkedIds }, container),
  ]);
  const bookmarked = bookmarkedIds?.includes(question.id) ?? false;
  const backHref = browseHref(params);
  const linkQuery = backHref === '/' ? '' : backHref.slice(1);
  const prevHref = neighbours.prev && `/questions/${neighbours.prev}${linkQuery}`;
  const nextHref = neighbours.next && `/questions/${neighbours.next}${linkQuery}`;
  const rootTopic = question.topicPath.split('/')[0];

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm ring-1 ring-inset ring-line hover:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300"
        >
          ← Back to results <Kbd>Esc</Kbd>
        </Link>
        <div className="flex items-center gap-1 rounded-full bg-surface px-1.5 py-1 shadow-sm ring-1 ring-inset ring-line">
          {viewer && (
            <VoteButtons questionId={question.id} score={voteSummary.tally.score} viewerDirection={voteSummary.viewerDirection} />
          )}
          {viewer && <BookmarkButton questionId={question.id} bookmarked={bookmarked} />}
          {!viewer && <span className="px-2 text-xs text-zinc-500">Sign in to vote and bookmark</span>}
        </div>
      </div>
      {isAdmin && (
        <div className="mt-3 flex justify-end">
          <ModerationActions id={question.id} status={question.status} />
        </div>
      )}

      <header className="relative mt-5 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${topicStyle(question.topicPath).accent}`} />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <TopicChip path={question.topicPath} />
          {question.topicPath.includes('/') && <TopicTrail path={question.topicPath} linked hideRoot />}
        </div>
        {question.stem.includes('\n') ? (
          <>
            <h1 className="sr-only">Question</h1>
            <Markdown className="mt-4 prose-lg">{question.stem}</Markdown>
          </>
        ) : (
          <h1 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-zinc-900 sm:text-[1.7rem] dark:text-zinc-50">
            <InlineMarkdown>{question.stem}</InlineMarkdown>
          </h1>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">{TYPE_LABELS[question.type] ?? question.type}</span>
          <StatusBadge status={question.status} />
          {question.tags.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
          {question.source && <span>Source: {question.source}</span>}
        </div>
      </header>

      <div className="mt-6">
        <AnswerReveal options={question.options} correctOptionId={question.answer?.correctOptionId}>
          {question.answer && <AnswerBody answer={question.answer} />}
        </AnswerReveal>
      </div>

      {viewer && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <NoteEditor questionId={question.id} initialContent={note} />
        </div>
      )}

      <nav aria-label="More questions" className="mt-8 grid gap-3 sm:grid-cols-3">
        <NeighbourLink href={prevHref} direction="prev" />
        {viewer ? (
          <Link
            href={`/practice/session?topic=${encodeURIComponent(rootTopic)}`}
            className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-500 px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:-translate-y-0.5"
          >
            🧠 Practise {topicLabel(rootTopic)}
            <span className="text-xs font-medium text-white/80">spaced repetition</span>
          </Link>
        ) : (
          <span />
        )}
        <NeighbourLink href={nextHref} direction="next" />
      </nav>

      {viewer && (
        <div className="mt-8 text-center">
          <ReportButton questionId={question.id} />
        </div>
      )}

      <KeyLinks links={{ Escape: backHref, ArrowLeft: prevHref ?? undefined, ArrowRight: nextHref ?? undefined }} />
    </article>
  );
}

function NeighbourLink({ href, direction }: { href: string | null; direction: 'prev' | 'next' }) {
  if (!href) return <span className="hidden sm:block" />;
  const isNext = direction === 'next';
  return (
    <Link
      href={href}
      rel={direction}
      className={`flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-300 ${
        isNext ? 'justify-end text-right' : ''
      }`}
    >
      {!isNext && <Kbd>←</Kbd>}
      <span>
        {isNext ? 'Next question' : 'Previous question'}
        <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">in your results</span>
      </span>
      {isNext && <Kbd>→</Kbd>}
    </Link>
  );
}

async function findNeighbours(
  id: string,
  params: BrowseParams,
  viewer: { isAdmin: boolean; bookmarkedIds: readonly string[] | null },
  container: Container,
): Promise<{ prev: string | null; next: string | null }> {
  const page = await searchQuestions(
    { ...browseSearchInput(params, viewer), page: { limit: NEIGHBOUR_WINDOW, offset: 0 } },
    container,
  );
  const ids = page.items.map((item) => item.id);
  const index = ids.indexOf(id);
  if (index === -1) return { prev: null, next: null };
  return { prev: ids[index - 1] ?? null, next: ids[index + 1] ?? null };
}
