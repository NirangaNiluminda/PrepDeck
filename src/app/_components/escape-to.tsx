'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Escape goes back to the results the reader came from, filters intact. */
export function EscapeTo({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
        return;
      }
      router.push(href);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [href, router]);

  return null;
}
