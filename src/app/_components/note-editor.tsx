'use client';

import { useState, useTransition } from 'react';
import { setNoteAction } from '../actions/notes';

/**
 * Private to the signed-in viewer — never shown to anyone else, and never
 * fed into search or the browse list. An explicit Save button rather than
 * autosave-on-blur: a note is exactly the kind of text worth not losing to
 * an accidental click away.
 */
export function NoteEditor({ questionId, initialContent }: { questionId: string; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const formData = new FormData();
    formData.set('questionId', questionId);
    formData.set('content', content);
    startTransition(async () => {
      const result = await setNoteAction(formData);
      if (result.ok) {
        setError(null);
        setSavedContent(content);
        setJustSaved(true);
      } else {
        setError(result.error ?? 'Could not save the note');
      }
    });
  };

  return (
    <div>
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Your notes</h2>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        Private to you. Rewording this in your own words is where the learning happens.
      </p>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setJustSaved(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            save();
          }
        }}
        rows={5}
        placeholder="Rewrite the answer in your own words…"
        className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="mt-2 flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={save}
          disabled={pending || content === savedContent}
          className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save note'}
        </button>
        {error && (
          <span role="alert" className="text-rose-600 dark:text-rose-400">
            {error}
          </span>
        )}
        {!error && !pending && justSaved && content === savedContent && (
          <span className="text-zinc-500 dark:text-zinc-400">Saved</span>
        )}
      </div>
    </div>
  );
}
