'use client';

import { useEffect } from 'react';

const isTextEntry = (element: Element | null): boolean => {
  if (!element) return false;
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(element.type);
  }
  return (element as HTMLElement).isContentEditable;
};

/**
 * "/" jumps to search; j and k move focus through the results. Moving real
 * focus, rather than a highlight, means Enter opens the result natively and
 * the focus ring doubles as the selection.
 */
export function ResultKeyboard({ searchInputId }: { searchInputId: string }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

      if (isTextEntry(document.activeElement)) {
        if (event.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      if (event.key === '/') {
        const search = document.getElementById(searchInputId);
        if (search instanceof HTMLInputElement) {
          event.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }

      if (event.key !== 'j' && event.key !== 'k') return;
      const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-result-link]')];
      if (links.length === 0) return;

      event.preventDefault();
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      const step = event.key === 'j' ? 1 : -1;
      const next = current === -1 ? 0 : Math.min(Math.max(current + step, 0), links.length - 1);
      links[next].focus();
      links[next].scrollIntoView({ block: 'nearest' });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchInputId]);

  return null;
}
