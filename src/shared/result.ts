/**
 * Explicit success/failure instead of throwing for expected failures.
 * Throw only for bugs and infrastructure faults.
 */
export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function unwrap<T>(r: Result<T, AppError>): T {
  if (!r.ok) throw new Error(`${r.error.code}: ${r.error.message}`);
  return r.value;
}

export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'UNAUTHENTICATED';

export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Record<string, string[]>;
}

export const validationError = (
  message: string,
  details?: Record<string, string[]>,
): AppError => ({ code: 'VALIDATION', message, details });

export const notFound = (what: string, id: string): AppError => ({
  code: 'NOT_FOUND',
  message: `${what} '${id}' was not found`,
});

export const forbidden = (message = 'Not allowed'): AppError => ({
  code: 'FORBIDDEN',
  message,
});

export const conflict = (message: string): AppError => ({
  code: 'CONFLICT',
  message,
});
