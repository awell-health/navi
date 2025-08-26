#!/usr/bin/env node

/*
 Generates an RSA keypair and prints:
 - Private key (PKCS#8 PEM)
 - Public key (SPKI PEM)
 - Public JWK with kid (for JWKS)
 - JWKS JSON you can host at /.well-known/jwks.json

 Usage:
   node scripts/generate-jwks.js
*/

const crypto = require("crypto");

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function generateRsaKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

function exportPublicJwk(publicKeyPem) {
  const keyObj = crypto.createPublicKey(publicKeyPem);
  // Node can export to JWK directly
  /** @type {{ kty: string; n: string; e: string }} */
  const jwk = keyObj.export({ format: "jwk" });
  return jwk;
}

function computeKid(jwk) {
  // RFC7638 thumbprint over ordered members (kty,e,n)
  const json = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
  const digest = crypto.createHash("sha256").update(json).digest();
  return base64url(digest);
}

console.log("\n🔐 Generating RSA keypair for RS256...\n");
const { publicKey, privateKey } = generateRsaKeypair();
const publicJwk = exportPublicJwk(publicKey);
const kid = computeKid(publicJwk);

const jwks = {
  keys: [
    {
      ...publicJwk,
      alg: "RS256",
      use: "sig",
      kid,
    },
  ],
};

console.log("Private key (PKCS#8 PEM) — keep secret:\n");
console.log(privateKey);

console.log("Public key (SPKI PEM):\n");
console.log(publicKey);

console.log("Public JWK (for JWKS):\n");
console.log(JSON.stringify(jwks.keys[0], null, 2));

console.log("\nJWKS (host at /.well-known/jwks.json):\n");
console.log(JSON.stringify(jwks, null, 2));

console.log(
  "\n➡️  Configure your Trusted Token Profile with:\n" +
    " - Issuer: your app origin (e.g., https://app.example.com)\n" +
    " - Audience: the aud you will place in your JWTs\n" +
    " - JWKS URL: https://<your-domain>/.well-known/jwks.json\n" +
    ` - kid: ${kid} (set in your JWT header)\n`
);
