import { MongoClient, type IndexDescription } from 'mongodb';
import { QUESTION_INDEXES } from '@/modules/questions';
import { BOOKMARK_INDEXES } from '@/modules/bookmarks';
import { ATTEMPT_INDEXES, REVIEW_CARD_INDEXES } from '@/modules/practice';
import { NOTE_INDEXES } from '@/modules/notes';
import { EXAM_SESSION_INDEXES } from '@/modules/exams';
import { USER_PROFILE_INDEXES } from '@/modules/users';

const COLLECTIONS: Record<string, IndexDescription[]> = {
  questions: QUESTION_INDEXES,
  bookmarks: BOOKMARK_INDEXES,
  reviewCards: REVIEW_CARD_INDEXES,
  attempts: ATTEMPT_INDEXES,
  notes: NOTE_INDEXES,
  examSessions: EXAM_SESSION_INDEXES,
  userProfiles: USER_PROFILE_INDEXES,
};

/**
 * Idempotent: createIndexes is a no-op for an index that already exists with
 * the same spec. Run at deploy, and after adding any field to a *Filter type.
 */
async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const client = new MongoClient(uri, { maxPoolSize: 10 });
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB ?? 'interview_prep');
    for (const [collection, indexes] of Object.entries(COLLECTIONS)) {
      // createIndexes rejects an empty array — a collection may legitimately
      // need none beyond the _id index Mongo always creates (notes, keyed by
      // (user, question) as _id, is one).
      if (indexes.length === 0) {
        console.log(`${collection}: no secondary indexes needed`);
        continue;
      }
      const created = await db.collection(collection).createIndexes(indexes);
      console.log(`${collection}: ensured ${created.length} indexes — ${created.join(', ')}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
