import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { createMockJwt } from './jwt.util';

export interface MockDirectoryUser {
  sub: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  mfaEnabled: boolean;
}

export interface OidcAuthorizeResult {
  transactionId: string;
  mfaRequired: boolean;
  mfaChannel: 'totp' | 'sms';
  /** Only surfaced in the demo so the UI can hint the expected code. */
  demoOtp?: string;
}

export interface OidcTokenSet {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface PendingTransaction {
  user: MockDirectoryUser;
  otp: string;
  createdAt: number;
}

/**
 * In-memory stand-in for a corporate OIDC identity provider (e.g. the bank's
 * SSO). It performs a two-step flow: primary credential authorization followed
 * by a multi-factor challenge, then exchanges a verified challenge for a token
 * set. No network calls are made; latency is simulated with `delay`.
 */
@Injectable()
export class MockOidcIdentityProviderService {
  private readonly networkLatencyMs = 600;
  private readonly refreshLifetimeSeconds = 3600;

  private readonly directory: MockDirectoryUser[] = [
    {
      sub: 'a1b2c3d4-0001',
      email: 'jane.customer@demo-bank.example',
      password: 'Password123!',
      name: 'Jane Customer',
      roles: ['customer'],
      mfaEnabled: true,
    },
    {
      sub: 'a1b2c3d4-0002',
      email: 'ops.admin@demo-bank.example',
      password: 'Password123!',
      name: 'Ops Admin',
      roles: ['customer', 'admin'],
      mfaEnabled: true,
    },
  ];

  private readonly pending = new Map<string, PendingTransaction>();

  /** Step 1 - validate primary credentials and issue an MFA challenge. */
  authorize(email: string, password: string): Observable<OidcAuthorizeResult> {
    const user = this.directory.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user || user.password !== password) {
      return throwError(new Error('Invalid email or password.')).pipe(delay(this.networkLatencyMs));
    }

    const transactionId = this.randomId();
    const otp = this.generateOtp();
    this.pending.set(transactionId, { user, otp, createdAt: Date.now() });

    return of<OidcAuthorizeResult>({
      transactionId,
      mfaRequired: user.mfaEnabled,
      mfaChannel: 'totp',
      demoOtp: otp,
    }).pipe(delay(this.networkLatencyMs));
  }

  /** Step 2 - verify the MFA challenge and exchange it for tokens. */
  verifyMfa(transactionId: string, code: string): Observable<OidcTokenSet> {
    const transaction = this.pending.get(transactionId);

    if (!transaction) {
      return throwError(new Error('Your session expired. Please sign in again.')).pipe(
        delay(this.networkLatencyMs),
      );
    }

    if (transaction.otp !== (code || '').trim()) {
      return throwError(new Error('That code is incorrect. Please try again.')).pipe(
        delay(this.networkLatencyMs),
      );
    }

    this.pending.delete(transactionId);
    return of(this.issueTokens(transaction.user)).pipe(delay(this.networkLatencyMs));
  }

  /** Exchange a refresh token for a fresh token set (simplified for the demo). */
  refresh(refreshToken: string): Observable<OidcTokenSet> {
    const sub = (refreshToken || '').replace(/^refresh\./, '');
    const user = this.directory.find(u => u.sub === sub);

    if (!user) {
      return throwError(new Error('Refresh token is no longer valid.')).pipe(delay(this.networkLatencyMs));
    }

    return of(this.issueTokens(user)).pipe(delay(this.networkLatencyMs));
  }

  private issueTokens(user: MockDirectoryUser): OidcTokenSet {
    const jwt = createMockJwt(
      {
        sub: user.sub,
        email: user.email,
        name: user.name,
        roles: user.roles,
        amr: ['pwd', 'mfa'],
      },
      this.refreshLifetimeSeconds,
    );

    return {
      idToken: jwt,
      accessToken: jwt,
      refreshToken: `refresh.${user.sub}`,
      expiresIn: this.refreshLifetimeSeconds,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private randomId(): string {
    return 'tx-' + Math.random().toString(36).slice(2, 12);
  }
}
