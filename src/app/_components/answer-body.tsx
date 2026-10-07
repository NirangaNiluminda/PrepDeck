import type { QuestionDetail } from '@/modules/questions';
import { InlineMarkdown, Markdown } from './markdown';

// A type-only import is erased at compile time, so this stays safe to import
// from both the question detail page (a Server Component) and PracticeSession
// (a Client Component) without pulling any module code into either bundle.
type Answer = NonNullable<QuestionDetail['answer']>;

/** The answer, key points, explanation and references — shared by the question page and a practice session. */
export function AnswerBody({ answer }: { answer: Answer }) {
  return (
    <div className="space-y-4">
      <Section title="Answer" emoji="💡" tone="bg-brand-50 dark:bg-brand-400/10">
        <Markdown>{answer.modelAnswer}</Markdown>
      </Section>

      {answer.keyPoints.length > 0 && (
        <Section title="Key points" emoji="✅" tone="bg-emerald-50 dark:bg-emerald-400/10">
          <ul className="space-y-2.5 text-zinc-800 dark:text-zinc-200">
            {answer.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white"
                >
                  {index + 1}
                </span>
                <span>
                  <InlineMarkdown>{point}</InlineMarkdown>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {answer.explanation && (
        <Section title="Explanation" emoji="📖" tone="bg-sky-50 dark:bg-sky-400/10">
          <Markdown>{answer.explanation}</Markdown>
        </Section>
      )}

      {answer.references && answer.references.length > 0 && (
        <Section title="References" emoji="🔗" tone="bg-amber-50 dark:bg-amber-400/10">
          <ul className="space-y-1.5 text-sm">
            {answer.references.map((reference) => (
              <li key={reference}>
                <a
                  href={reference}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-all font-medium text-brand-600 hover:underline dark:text-brand-400"
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

interface SectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly emoji?: string;
  /** Background for the emoji badge. */
  readonly tone?: string;
}

export function Section({ title, children, emoji, tone = 'bg-surface-muted' }: SectionProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {emoji && (
          <span aria-hidden className={`flex size-7 items-center justify-center rounded-lg text-sm ${tone}`}>
            {emoji}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}
