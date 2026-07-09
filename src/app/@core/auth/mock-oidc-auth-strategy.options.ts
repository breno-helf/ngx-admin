import { NbAuthStrategyOptions } from '@nebular/auth';

/**
 * Options for {@link MockOidcAuthStrategy}. Redirect targets mirror the routes
 * declared in the auth feature module.
 */
export class MockOidcAuthStrategyOptions extends NbAuthStrategyOptions {
  name = 'email';
  login? = {
    redirect: '/auth/login',
  };
  mfa? = {
    redirect: '/auth/mfa',
  };
  success? = {
    redirect: '/pages',
  };
  logout? = {
    redirect: '/auth/login',
  };
}

export const mockOidcStrategyOptions: MockOidcAuthStrategyOptions = new MockOidcAuthStrategyOptions();
