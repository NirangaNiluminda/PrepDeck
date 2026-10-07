'use client';

import { useEffect } from 'react';

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        The page couldn&apos;t load. If the database connection dropped, trying again usually works.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500"
      >
        Try again
      </button>
    </div>
  );
}
