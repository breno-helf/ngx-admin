import { fakeAsync, tick } from '@angular/core/testing';

import { MockOidcIdentityProviderService, OidcAuthorizeResult, OidcTokenSet } from './mock-oidc-identity-provider.service';

describe('MockOidcIdentityProviderService', () => {
  let service: MockOidcIdentityProviderService;

  const validEmail = 'jane.customer@demo-bank.example';
  const validPassword = 'Password123!';

  beforeEach(() => {
    service = new MockOidcIdentityProviderService();
  });

  it('authorizes valid credentials and requires MFA', fakeAsync(() => {
    let result: OidcAuthorizeResult | undefined;
    service.authorize(validEmail, validPassword).subscribe(r => (result = r));
    tick(1000);

    expect(result).toBeDefined();
    expect(result!.mfaRequired).toBe(true);
    expect(result!.transactionId).toContain('tx-');
    expect(result!.demoOtp).toMatch(/^\d{6}$/);
  }));

  it('rejects invalid credentials', fakeAsync(() => {
    let error: Error | undefined;
    service.authorize(validEmail, 'wrong').subscribe({ error: e => (error = e) });
    tick(1000);

    expect(error).toBeDefined();
    expect(error!.message).toContain('Invalid');
  }));

  it('exchanges a correct MFA code for a token set', fakeAsync(() => {
    let authorize: OidcAuthorizeResult | undefined;
    service.authorize(validEmail, validPassword).subscribe(r => (authorize = r));
    tick(1000);

    let tokens: OidcTokenSet | undefined;
    service.verifyMfa(authorize!.transactionId, authorize!.demoOtp!).subscribe(t => (tokens = t));
    tick(1000);

    expect(tokens).toBeDefined();
    expect(tokens!.accessToken.split('.').length).toBe(3);
    expect(tokens!.refreshToken).toContain('refresh.');
    expect(tokens!.expiresIn).toBeGreaterThan(0);
  }));

  it('rejects an incorrect MFA code', fakeAsync(() => {
    let authorize: OidcAuthorizeResult | undefined;
    service.authorize(validEmail, validPassword).subscribe(r => (authorize = r));
    tick(1000);

    let error: Error | undefined;
    service.verifyMfa(authorize!.transactionId, '000000').subscribe({ error: e => (error = e) });
    tick(1000);

    expect(error).toBeDefined();
    expect(error!.message).toContain('incorrect');
  }));

  it('refreshes tokens for a known refresh token', fakeAsync(() => {
    let tokens: OidcTokenSet | undefined;
    service.refresh('refresh.a1b2c3d4-0001').subscribe(t => (tokens = t));
    tick(1000);

    expect(tokens).toBeDefined();
    expect(tokens!.accessToken.split('.').length).toBe(3);
  }));
});
