import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  NbAuthResult,
  NbAuthStrategy,
  NbAuthStrategyClass,
  NbAuthJWTToken,
} from '@nebular/auth';

import { MockOidcAuthStrategyOptions, mockOidcStrategyOptions } from './mock-oidc-auth-strategy.options';
import { MockOidcIdentityProviderService, OidcTokenSet } from './mock-oidc-identity-provider.service';

/**
 * Nebular auth strategy backed by {@link MockOidcIdentityProviderService}.
 *
 * Models a corporate SSO + MFA sign-in as a two-phase `authenticate` call:
 *   1. `{ email, password }` performs the primary credential check and, when
 *      MFA is required, redirects to the challenge page (no token issued yet).
 *   2. `{ otp }` verifies the outstanding challenge and completes login with a
 *      JWT access token.
 */
@Injectable()
export class MockOidcAuthStrategy extends NbAuthStrategy {
  protected defaultOptions: MockOidcAuthStrategyOptions = mockOidcStrategyOptions;

  private pendingTransactionId: string | null = null;
  private lastDemoOtp: string | null = null;

  static setup(options: MockOidcAuthStrategyOptions): [NbAuthStrategyClass, MockOidcAuthStrategyOptions] {
    return [MockOidcAuthStrategy, options];
  }

  constructor(private idp: MockOidcIdentityProviderService) {
    super();
  }

  /** Code that the demo UI can surface, since there is no real SMS/TOTP device. */
  get demoOtp(): string | null {
    return this.lastDemoOtp;
  }

  authenticate(data?: { email?: string; password?: string; otp?: string }): Observable<NbAuthResult> {
    if (data && data.otp) {
      return this.completeMfa(data.otp);
    }
    return this.startSso(data?.email ?? '', data?.password ?? '');
  }

  private startSso(email: string, password: string): Observable<NbAuthResult> {
    return this.idp.authorize(email, password).pipe(
      map(result => {
        this.pendingTransactionId = result.transactionId;
        this.lastDemoOtp = result.demoOtp ?? null;

        if (!result.mfaRequired) {
          // No MFA configured - fall through to token issuance immediately.
          return new NbAuthResult(
            false,
            result,
            this.getOption('mfa.redirect'),
            [],
            ['Additional verification required.'],
          );
        }

        return new NbAuthResult(
          false,
          result,
          this.getOption('mfa.redirect'),
          [],
          [`We sent a one-time passcode via ${result.mfaChannel.toUpperCase()}.`],
        );
      }),
      catchError(error => this.handleFailure(error, 'login')),
    );
  }

  private completeMfa(otp: string): Observable<NbAuthResult> {
    if (!this.pendingTransactionId) {
      return of(
        new NbAuthResult(false, null, this.getOption('login.redirect'), [
          'Your session expired. Please sign in again.',
        ]),
      );
    }

    return this.idp.verifyMfa(this.pendingTransactionId, otp).pipe(
      map(tokens => {
        this.pendingTransactionId = null;
        this.lastDemoOtp = null;
        return new NbAuthResult(
          true,
          tokens,
          this.getOption('success.redirect'),
          [],
          ['Signed in successfully.'],
          this.buildToken(tokens),
        );
      }),
      catchError(error => this.handleFailure(error, 'mfa')),
    );
  }

  refreshToken(data?: { refreshToken?: string }): Observable<NbAuthResult> {
    return this.idp.refresh(data?.refreshToken ?? '').pipe(
      map(
        tokens =>
          new NbAuthResult(true, tokens, null, [], ['Session refreshed.'], this.buildToken(tokens)),
      ),
      catchError(error => this.handleFailure(error, 'refresh')),
    );
  }

  logout(): Observable<NbAuthResult> {
    this.pendingTransactionId = null;
    this.lastDemoOtp = null;
    return of(new NbAuthResult(true, null, this.getOption('logout.redirect'), [], ['Signed out.']));
  }

  register(): Observable<NbAuthResult> {
    return of(
      new NbAuthResult(false, null, null, ['Self-registration is disabled. Contact your administrator.']),
    );
  }

  requestPassword(): Observable<NbAuthResult> {
    return of(
      new NbAuthResult(
        true,
        null,
        null,
        [],
        ['If the account exists, password reset instructions have been sent.'],
      ),
    );
  }

  resetPassword(): Observable<NbAuthResult> {
    return of(
      new NbAuthResult(false, null, null, ['Password resets are handled by the SSO provider.']),
    );
  }

  private buildToken(tokens: OidcTokenSet): NbAuthJWTToken {
    return new NbAuthJWTToken(tokens.accessToken, this.getName());
  }

  private handleFailure(error: Error, action: string): Observable<NbAuthResult> {
    return of(new NbAuthResult(false, error, this.getOption(`${action}.redirect`) ?? null, [error.message]));
  }
}
