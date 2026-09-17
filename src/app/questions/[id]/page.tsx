import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getContainer } from '@/composition/container';
import { listBookmarkedQuestionIds } from '@/modules/bookmarks';
import { getQuestion } from '@/modules/questions';
import { getNote } from '@/modules/notes';
import { AnswerBody } from '../../_components/answer-body';
import { AnswerReveal } from '../../_components/answer-reveal';
import { DifficultyBadge, Kbd, StatusBadge, TagLink, TopicTrail } from '../../_components/badges';
import { BookmarkButton } from '../../_components/bookmark-button';
import { EscapeTo } from '../../_components/escape-to';
import { InlineMarkdown, Markdown } from '../../_components/markdown';
import { ModerationActions } from '../../_components/moderation-actions';
import { NoteEditor } from '../../_components/note-editor';
import { browseHref, parseBrowseParams } from '../../_lib/browse-params';
import { TYPE_LABELS } from '../../_lib/labels';
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

export default async function QuestionPage(props: PageProps<'/questions/[id]'>) {
  const [{ id }, search] = await Promise.all([props.params, props.searchParams]);
  const { viewer, container, question } = await loadQuestion(id);

  // Not-published and missing look the same to a learner, so a draft's
  // existence isn't revealed by a different error.
  if (!question) notFound();

  const isAdmin = viewer?.role === 'admin';
  const [bookmarked, note] = await Promise.all([
    viewer
      ? listBookmarkedQuestionIds({ userId: viewer.userId }, container).then((ids) => ids.includes(question.id))
      : Promise.resolve(false),
    viewer ? getNote({ userId: viewer.userId, questionId: question.id }, container) : Promise.resolve(''),
  ]);
  const backHref = browseHref(parseBrowseParams(search));

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to results <Kbd>Esc</Kbd>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && <ModerationActions id={question.id} status={question.status} />}
          {viewer && <BookmarkButton questionId={question.id} bookmarked={bookmarked} />}
        </div>
      </div>

      <header className="mt-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TopicTrail path={question.topicPath} linked />
        </p>
        {question.stem.includes('\n') ? (
          <>
            <h1 className="sr-only">Question</h1>
            <Markdown className="mt-2 prose-lg">{question.stem}</Markdown>
          </>
        ) : (
          <h1 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
            <InlineMarkdown>{question.stem}</InlineMarkdown>
          </h1>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <DifficultyBadge difficulty={question.difficulty} />
          <span>{TYPE_LABELS[question.type] ?? question.type}</span>
          <StatusBadge status={question.status} />
          {question.tags.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
          {question.source && <span className="text-xs">Source: {question.source}</span>}
        </div>
      </header>

      <div className="mt-8">
        <AnswerReveal options={question.options} correctOptionId={question.answer?.correctOptionId}>
          {question.answer && <AnswerBody answer={question.answer} />}
        </AnswerReveal>
      </div>

      {viewer && (
        <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <NoteEditor questionId={question.id} initialContent={note} />
        </div>
      )}

      <EscapeTo href={backHref} />
    </article>
  );
}
