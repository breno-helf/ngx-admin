import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NB_AUTH_OPTIONS, NbAuthResult, NbAuthService } from '@nebular/auth';

import { MockOidcAuthStrategy } from '../mock-oidc-auth.strategy';

/**
 * Second factor (MFA) challenge screen. Sits between primary SSO credential
 * entry and an issued session. Delegates verification to the configured
 * Nebular strategy via `NbAuthService.authenticate(..., { otp })`.
 */
@Component({
  selector: 'ngx-mfa',
  styleUrls: ['./mfa.component.scss'],
  templateUrl: './mfa.component.html',
})
export class MfaComponent {
  strategy = 'email';
  redirectDelay = 500;

  submitted = false;
  code = '';
  errors: string[] = [];
  messages: string[] = [];

  constructor(
    protected service: NbAuthService,
    protected oidcStrategy: MockOidcAuthStrategy,
    @Inject(NB_AUTH_OPTIONS) protected options: unknown,
    protected router: Router,
  ) {}

  /** Demo-only hint so testers can complete MFA without a real device. */
  get demoOtp(): string | null {
    return this.oidcStrategy.demoOtp;
  }

  verify(): void {
    this.errors = [];
    this.messages = [];
    this.submitted = true;

    this.service.authenticate(this.strategy, { otp: this.code }).subscribe((result: NbAuthResult) => {
      this.submitted = false;

      if (result.isSuccess()) {
        this.messages = result.getMessages();
      } else {
        this.errors = result.getErrors();
      }

      const redirect = result.getRedirect();
      if (redirect) {
        setTimeout(() => this.router.navigateByUrl(redirect), this.redirectDelay);
      }
    });
  }
}
