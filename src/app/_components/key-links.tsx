'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Single keys that navigate: Escape back to the results the reader came from,
 * filters intact; ← and → to the previous and next question in that list.
 */
export function KeyLinks({ links }: { links: Partial<Record<'Escape' | 'ArrowLeft' | 'ArrowRight', string>> }) {
  const router = useRouter();
  const { Escape, ArrowLeft, ArrowRight } = links;

  useEffect(() => {
    const hrefs: Record<string, string | undefined> = { Escape, ArrowLeft, ArrowRight };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const href = hrefs[event.key];
      if (!href) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      router.push(href);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [Escape, ArrowLeft, ArrowRight, router]);

  return null;
}
