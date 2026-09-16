'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// The filter form remounts after each navigation (it is keyed by the URL, so
// its fields can never disagree with it). This carries keyboard focus across
// the remount.
let refocus: { name: string; value: string } | null = null;

/**
 * Progressive enhancement for the browse page's GET form. Without JavaScript
 * it submits like any form. With it, filters apply the moment they change,
 * navigation stays client-side, and empty fields are dropped so shared URLs
 * stay short.
 */
export function FilterFormEnhancer({ formId }: { formId: string }) {
  const router = useRouter();

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;

    if (refocus) {
      const { name, value } = refocus;
      refocus = null;
      const match = [...form.elements].find(
        (el): el is HTMLInputElement | HTMLSelectElement =>
          (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) &&
          el.name === name &&
          (el.type === 'search' || el instanceof HTMLSelectElement || el.value === value),
      );
      match?.focus();
    }

    const navigate = () => {
      const active = document.activeElement;
      if ((active instanceof HTMLInputElement || active instanceof HTMLSelectElement) && active.form === form) {
        refocus = { name: active.name, value: active.value };
      }

      const query = new URLSearchParams();
      for (const [key, value] of new FormData(form)) {
        if (typeof value === 'string' && value.trim()) query.append(key, value.trim());
      }
      const qs = query.toString();
      router.push(qs ? `/?${qs}` : '/', { scroll: false });
    };

    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      navigate();
    };

    // Listening on document, not the form: the search box and sort menu sit
    // outside the <form> element and join it through their form attribute.
    const onChange = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLSelectElement;
      if (field.form !== form) return;
      // Search applies on Enter rather than whenever the box loses focus.
      if (field.type === 'search') return;
      navigate();
    };

    form.addEventListener('submit', onSubmit);
    document.addEventListener('change', onChange);
    return () => {
      form.removeEventListener('submit', onSubmit);
      document.removeEventListener('change', onChange);
    };
  }, [formId, router]);

  return null;
}
