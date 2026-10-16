import { NextResponse, connection } from 'next/server';
import { measureDb } from '@/composition/mongo-client';

// Module scope lives as long as the server instance, so these tell a request
// that started a fresh instance (a cold start) from one reusing a warm one.
const instanceStartedAt = Date.now();
let requestsServed = 0;

/**
 * Liveness plus where a request's time goes: instance cold or warm, and the
 * database connect / ping / DNS split. Timings only, safe to expose; useful
 * for an uptime monitor as well as for chasing slow first loads.
 */
export async function GET() {
  await connection();
  const coldStart = requestsServed++ === 0;
  try {
    const db = await measureDb();
    return NextResponse.json(
      { ok: true, coldStart, instanceAgeMs: Date.now() - instanceStartedAt, region: process.env.VERCEL_REGION ?? null, db },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    // Never the driver's error text: it can include hostnames.
    return NextResponse.json({ ok: false, coldStart }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
