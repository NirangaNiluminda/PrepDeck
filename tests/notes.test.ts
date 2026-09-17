import { describe, it, expect } from 'vitest';
import { fixedClock } from '@/shared/system-adapters';
import { InMemoryNoteRepository, getNote, setNote, MAX_NOTE_LENGTH } from '@/modules/notes';

const deps = () => ({ notes: new InMemoryNoteRepository(), clock: fixedClock('2026-01-15T10:00:00Z') });

describe('setNote / getNote', () => {
  it('saves a note and reads it back', async () => {
    const d = deps();

    const result = await setNote({ userId: 'u1', questionId: 'q-1', content: 'My own wording.' }, d);

    expect(result.ok && result.value.content).toBe('My own wording.');
    expect(await getNote({ userId: 'u1', questionId: 'q-1' }, d)).toBe('My own wording.');
  });

  it('returns an empty string when there is no note', async () => {
    expect(await getNote({ userId: 'u1', questionId: 'q-1' }, deps())).toBe('');
  });

  it('clears the note when saved with empty or whitespace-only content', async () => {
    const d = deps();
    await setNote({ userId: 'u1', questionId: 'q-1', content: 'Something.' }, d);

    await setNote({ userId: 'u1', questionId: 'q-1', content: '   ' }, d);

    expect(await getNote({ userId: 'u1', questionId: 'q-1' }, d)).toBe('');
    expect(d.notes.size).toBe(0);
  });

  it('rejects content over the length limit', async () => {
    const result = await setNote({ userId: 'u1', questionId: 'q-1', content: 'x'.repeat(MAX_NOTE_LENGTH + 1) }, deps());

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it("never shows one user another user's note on the same question", async () => {
    const d = deps();
    await setNote({ userId: 'alice', questionId: 'q-1', content: "Alice's note." }, d);

    expect(await getNote({ userId: 'bob', questionId: 'q-1' }, d)).toBe('');
    expect(await getNote({ userId: 'alice', questionId: 'q-1' }, d)).toBe("Alice's note.");
  });
});
