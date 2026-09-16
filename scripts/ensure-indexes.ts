import { MongoClient } from 'mongodb';
import { QUESTION_INDEXES } from '@/modules/questions';

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
    const created = await db.collection('questions').createIndexes(QUESTION_INDEXES);
    console.log(`questions: ensured ${created.length} indexes — ${created.join(', ')}`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
