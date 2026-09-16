// The module's public API. Routes call getSession() and nothing deeper.

import { DevAuthProvider } from './adapters/dev-auth-provider';
import type { AuthProvider, Session } from './ports/auth-provider';

export type { AuthProvider, Role, Session } from './ports/auth-provider';

const provider: AuthProvider = new DevAuthProvider();

export const getSession = (): Promise<Session | null> => provider.getSession();
