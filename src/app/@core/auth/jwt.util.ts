/**
 * Helpers for producing mock (unsigned) JWTs so the demo mimics the shape of
 * tokens returned by a real OIDC provider without requiring a backend.
 */

function base64UrlEncode(value: string): string {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface MockJwtClaims {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  amr: string[];
}

/**
 * Builds a mock JWT string (`header.payload.signature`) whose payload can be
 * decoded by `NbAuthJWTToken`. The signature segment is a fixed placeholder as
 * the token is never verified server-side in the demo.
 */
export function createMockJwt(claims: MockJwtClaims, lifetimeSeconds = 3600): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', kid: 'demo-signing-key' };
  const payload = {
    iss: 'https://sso.demo-bank.example/oidc',
    aud: 'ngx-admin-demo',
    ...claims,
    iat: issuedAt,
    exp: issuedAt + lifetimeSeconds,
  };

  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    'demo-signature',
  ].join('.');
}
