import { resolveSrv } from 'node:dns/promises';
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

/** For scripts: an open client keeps Node's event loop alive after the work is done. */
export const closeDb = async (): Promise<void> => {
  const pending = global.__mongoClientPromise;
  global.__mongoClientPromise = undefined;
  await pending?.then((client) => client.close(), () => undefined);
};

export const getDb = async (): Promise<Db> =>
  (await connect()).db(process.env.MONGODB_DB ?? 'interview_prep');

export interface DbTimings {
  /** Time to get a connected client: near zero on a warm instance, the full handshake on a cold one. */
  readonly connectMs: number;
  /** One round trip to the primary once connected. */
  readonly pingMs: number;
  /** DNS SRV lookup for a mongodb+srv URI, timed on its own; null for a plain mongodb:// URI. */
  readonly srvLookupMs: number | null;
}

const elapsed = (start: number) => Math.round(performance.now() - start);

/**
 * Where a request's database time goes, for /api/health. Timings only:
 * nothing about the host, user or data leaves this function.
 */
export async function measureDb(): Promise<DbTimings> {
  const uri = process.env.MONGODB_URI ?? '';
  let srvLookupMs: number | null = null;
  if (uri.startsWith('mongodb+srv://')) {
    const host = new URL(uri.replace('mongodb+srv://', 'https://')).hostname;
    const start = performance.now();
    await resolveSrv(`_mongodb._tcp.${host}`).catch(() => []);
    srvLookupMs = elapsed(start);
  }

  let start = performance.now();
  const client = await connect();
  const connectMs = elapsed(start);

  start = performance.now();
  await client.db('admin').command({ ping: 1 });
  return { connectMs, pingMs: elapsed(start), srvLookupMs };
}
