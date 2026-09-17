import type { QuestionDetail } from '@/modules/questions';
import { InlineMarkdown, Markdown } from './markdown';

// A type-only import is erased at compile time, so this stays safe to import
// from both the question detail page (a Server Component) and PracticeSession
// (a Client Component) without pulling any module code into either bundle.
type Answer = NonNullable<QuestionDetail['answer']>;

/** The answer, key points, explanation and references — shared by the question page and a practice session. */
export function AnswerBody({ answer }: { answer: Answer }) {
  return (
    <div className="space-y-8">
      <Section title="Answer">
        <Markdown>{answer.modelAnswer}</Markdown>
      </Section>

      {answer.keyPoints.length > 0 && (
        <Section title="Key points">
          <ul className="space-y-1.5 text-zinc-800 dark:text-zinc-200">
            {answer.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>
                  <InlineMarkdown>{point}</InlineMarkdown>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {answer.explanation && (
        <Section title="Explanation">
          <Markdown>{answer.explanation}</Markdown>
        </Section>
      )}

      {answer.references && answer.references.length > 0 && (
        <Section title="References">
          <ul className="space-y-1 text-sm">
            {answer.references.map((reference) => (
              <li key={reference}>
                <a
                  href={reference}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-all text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {reference}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}
