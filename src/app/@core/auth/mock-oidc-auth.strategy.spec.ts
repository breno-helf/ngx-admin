import { fakeAsync, tick } from '@angular/core/testing';
import { NbAuthResult } from '@nebular/auth';

import { MockOidcAuthStrategy } from './mock-oidc-auth.strategy';
import { MockOidcIdentityProviderService } from './mock-oidc-identity-provider.service';

describe('MockOidcAuthStrategy', () => {
  let idp: MockOidcIdentityProviderService;
  let strategy: MockOidcAuthStrategy;

  const validEmail = 'jane.customer@demo-bank.example';
  const validPassword = 'Password123!';

  beforeEach(() => {
    idp = new MockOidcIdentityProviderService();
    strategy = new MockOidcAuthStrategy(idp);
    strategy.setOptions({ name: 'email' });
  });

  it('first phase redirects to MFA without issuing a token', fakeAsync(() => {
    let result: NbAuthResult | undefined;
    strategy.authenticate({ email: validEmail, password: validPassword }).subscribe(r => (result = r));
    tick(1000);

    expect(result!.isSuccess()).toBe(false);
    expect(result!.getRedirect()).toBe('/auth/mfa');
    expect(result!.getToken()).toBeFalsy();
    expect(strategy.demoOtp).toMatch(/^\d{6}$/);
  }));

  it('reports an error for bad credentials', fakeAsync(() => {
    let result: NbAuthResult | undefined;
    strategy.authenticate({ email: validEmail, password: 'nope' }).subscribe(r => (result = r));
    tick(1000);

    expect(result!.isFailure()).toBe(true);
    expect(result!.getErrors()[0]).toContain('Invalid');
  }));

  it('second phase completes login with a JWT on a valid code', fakeAsync(() => {
    strategy.authenticate({ email: validEmail, password: validPassword }).subscribe();
    tick(1000);
    const otp = strategy.demoOtp!;

    let result: NbAuthResult | undefined;
    strategy.authenticate({ otp }).subscribe(r => (result = r));
    tick(1000);

    expect(result!.isSuccess()).toBe(true);
    expect(result!.getRedirect()).toBe('/pages');
    expect(result!.getToken().getValue().split('.').length).toBe(3);
  }));

  it('rejects an invalid MFA code', fakeAsync(() => {
    strategy.authenticate({ email: validEmail, password: validPassword }).subscribe();
    tick(1000);

    let result: NbAuthResult | undefined;
    strategy.authenticate({ otp: '000000' }).subscribe(r => (result = r));
    tick(1000);

    expect(result!.isFailure()).toBe(true);
    expect(result!.getErrors()[0]).toContain('incorrect');
  }));

  it('fails MFA gracefully when there is no pending session', fakeAsync(() => {
    let result: NbAuthResult | undefined;
    strategy.authenticate({ otp: '123456' }).subscribe(r => (result = r));
    tick(1000);

    expect(result!.isFailure()).toBe(true);
    expect(result!.getRedirect()).toBe('/auth/login');
  }));
});
