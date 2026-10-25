import { describe, it, expect } from "vitest";
import { buildAuthUrl, type Discovery } from "../oidc";

const discovery: Discovery = {
  issuer: "https://idp.example",
  authorization_endpoint: "https://idp.example/authorize",
  token_endpoint: "https://idp.example/token",
  jwks_uri: "https://idp.example/jwks",
};

describe("oidc.buildAuthUrl", () => {
  it("builds a compliant Authorization Code request", () => {
    const url = new URL(
      buildAuthUrl({
        discovery,
        clientId: "client-abc",
        redirectUri: "https://app.bcap.sa/auth/sso/acme/callback",
        state: "STATE1",
        nonce: "NONCE1",
      })
    );
    expect(url.origin + url.pathname).toBe("https://idp.example/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("client_id")).toBe("client-abc");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://app.bcap.sa/auth/sso/acme/callback"
    );
    expect(url.searchParams.get("state")).toBe("STATE1");
    expect(url.searchParams.get("nonce")).toBe("NONCE1");
  });

  it("adds a domain hint when provided", () => {
    const url = new URL(
      buildAuthUrl({
        discovery,
        clientId: "c",
        redirectUri: "https://x/cb",
        state: "s",
        nonce: "n",
        domainHint: "acme.com",
      })
    );
    expect(url.searchParams.get("hd")).toBe("acme.com");
  });
});
