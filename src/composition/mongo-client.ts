import { MongoClient, type Db } from 'mongodb';

/**
 * Serverless connection reuse. Without the globalThis cache, every hot reload
 * in dev and every cold lambda opens a new pool, and the Atlas free tier
 * (500 connections) is exhausted surprisingly fast.
 */
declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = { maxPoolSize: 10, minPoolSize: 0 };

/**
 * Connecting lazily rather than at module load keeps `next build` working
 * without a database: the env var is only required once a request actually
 * reaches the repository.
 */
const connect = (): Promise<MongoClient> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  global.__mongoClientPromise ??= new MongoClient(uri, options)
    .connect()
    .catch((error: unknown) => {
      // A cached rejection would fail every later request until restart; drop
      // it so one transient DNS or network blip doesn't take the app down.
      global.__mongoClientPromise = undefined;
      throw error;
    });

  return global.__mongoClientPromise;
};

export const getDb = async (): Promise<Db> =>
  (await connect()).db(process.env.MONGODB_DB ?? 'interview_prep');
