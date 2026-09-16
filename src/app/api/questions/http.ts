import { NextResponse } from 'next/server';
import type { AppError, ErrorCode, Result } from '@/shared/result';

const STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export const fail = (error: AppError) =>
  NextResponse.json(
    { error: { code: error.code, message: error.message, details: error.details } },
    { status: STATUS[error.code] },
  );

export const respond = <T>(result: Result<T>, status = 200) =>
  result.ok ? NextResponse.json(result.value, { status }) : fail(result.error);
