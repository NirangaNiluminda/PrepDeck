import type { NextRequest } from 'next/server';
import { getContainer, getSession } from '@/composition/container';
import { getQuestion, publishQuestion } from '@/modules/questions';
import { fail, respond } from '../http';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const container = await getContainer();

  // Answers are withheld unless explicitly requested — the exam runner passes
  // reveal=false so a learner cannot read the answer out of the network tab.
  const reveal = request.nextUrl.searchParams.get('reveal') !== 'false';

  const result = await getQuestion(
    {
      id,
      viewerId: session?.userId ?? null,
      viewerIsAdmin: session?.role === 'admin',
      revealAnswer: reveal,
    },
    container,
  );

  return respond(result);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return fail({ code: 'UNAUTHENTICATED', message: 'Sign in required' });
  }

  const result = await publishQuestion(
    { id, moderatorId: session.userId, moderatorIsAdmin: session.role === 'admin' },
    await getContainer(),
  );

  return respond(result);
}
