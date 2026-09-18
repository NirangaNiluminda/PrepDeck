/** Maps one external account to our own userId — minted once, reused on every later sign-in. */
export interface AuthIdentity {
  readonly provider: string;
  readonly providerId: string;
  readonly userId: string;
  readonly createdAt: Date;
}
