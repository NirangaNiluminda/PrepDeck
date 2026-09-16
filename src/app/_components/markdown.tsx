import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown renders no raw HTML and strips unsafe link protocols by
// default, so question content can't inject script into the page.

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div
      className={`prose prose-zinc max-w-none dark:prose-invert prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-code:before:content-none prose-code:after:content-none ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

const INLINE_ELEMENTS = ['p', 'code', 'strong', 'em', 'del'];

/**
 * For stems and key points shown inline: keeps `code` and emphasis, drops
 * block structure. No links, so it can sit inside another link safely.
 */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={INLINE_ELEMENTS}
      unwrapDisallowed
      components={{
        p: ({ children: content }) => <>{content}</>,
        code: ({ children: content }) => (
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-zinc-800">{content}</code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
