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

  return (global.__mongoClientPromise ??= new MongoClient(uri, options).connect());
};

export const getDb = async (): Promise<Db> =>
  (await connect()).db(process.env.MONGODB_DB ?? 'interview_prep');
