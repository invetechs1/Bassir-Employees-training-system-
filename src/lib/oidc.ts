import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Minimal OpenID Connect (Authorization Code flow) client. Works with any
 * compliant provider (Google, Microsoft Entra ID, Okta, Auth0, …). Discovery,
 * token exchange and ID-token verification only — no external OIDC dependency.
 */

export interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
}

export async function discover(issuer: string): Promise<Discovery> {
  const base = issuer.replace(/\/$/, "");
  const url = `${base}/.well-known/openid-configuration`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed (${res.status}) for ${url}`);
  }
  const doc = (await res.json()) as Partial<Discovery>;
  if (!doc.authorization_endpoint || !doc.token_endpoint || !doc.jwks_uri) {
    throw new Error("OIDC discovery document is missing required endpoints");
  }
  return {
    issuer: doc.issuer ?? base,
    authorization_endpoint: doc.authorization_endpoint,
    token_endpoint: doc.token_endpoint,
    jwks_uri: doc.jwks_uri,
  };
}

export function buildAuthUrl(params: {
  discovery: Discovery;
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  domainHint?: string | null;
}): string {
  const u = new URL(params.discovery.authorization_endpoint);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", params.state);
  u.searchParams.set("nonce", params.nonce);
  if (params.domainHint) u.searchParams.set("hd", params.domainHint);
  return u.toString();
}

export interface TokenResponse {
  id_token?: string;
  access_token?: string;
  token_type?: string;
}

export async function exchangeCode(params: {
  discovery: Discovery;
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  });
  const res = await fetch(params.discovery.token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`OIDC token exchange failed (${res.status})`);
  }
  return (await res.json()) as TokenResponse;
}

export interface IdClaims {
  email: string;
  name?: string;
  sub: string;
}

export async function verifyIdToken(params: {
  idToken: string;
  discovery: Discovery;
  clientId: string;
  nonce: string;
}): Promise<IdClaims> {
  const jwks = createRemoteJWKSet(new URL(params.discovery.jwks_uri));
  const { payload } = await jwtVerify(params.idToken, jwks, {
    issuer: params.discovery.issuer,
    audience: params.clientId,
  });
  if (params.nonce && payload.nonce !== params.nonce) {
    throw new Error("OIDC nonce mismatch");
  }
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!email) throw new Error("OIDC token did not include an email");
  return {
    email: email.toLowerCase(),
    name: typeof payload.name === "string" ? payload.name : undefined,
    sub: String(payload.sub),
  };
}
