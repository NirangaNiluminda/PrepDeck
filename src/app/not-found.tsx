import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        That question doesn&apos;t exist, or it isn&apos;t published yet.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        Browse questions
      </Link>
    </div>
  );
}
