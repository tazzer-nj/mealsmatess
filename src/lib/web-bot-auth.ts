import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  type JsonWebKey,
  type KeyObject,
} from "node:crypto";

const KEY_ID = "mealmate-bot-ed25519-1";

let cachedKeys:
  | {
      privateKey: KeyObject;
      publicKey: KeyObject;
      publicJwk: JsonWebKey & {
        kty: string;
        crv: string;
        x: string;
        kid: string;
        use: string;
        alg: string;
      };
    }
  | undefined;

function getOrCreateBotKeys() {
  if (cachedKeys) return cachedKeys;

  const pem = process.env["WEB_BOT_AUTH_PRIVATE_KEY_PEM"]?.trim();
  let privateKey: KeyObject;
  let publicKey: KeyObject;

  if (pem) {
    privateKey = createPrivateKey(pem.replace(/\\n/g, "\n"));
    publicKey = createPublicKey(privateKey);
  } else {
    const generated = generateKeyPairSync("ed25519");
    privateKey = generated.privateKey;
    publicKey = generated.publicKey;
  }

  const exported = publicKey.export({ format: "jwk" });
  cachedKeys = {
    privateKey,
    publicKey,
    publicJwk: {
      ...exported,
      kty: exported.kty ?? "OKP",
      crv: exported.crv ?? "Ed25519",
      x: exported.x ?? "",
      kid: KEY_ID,
      use: "sig",
      alg: "EdDSA",
    },
  };
  return cachedKeys;
}

export function getWebBotAuthDirectory() {
  const { publicJwk } = getOrCreateBotKeys();
  return {
    keys: [publicJwk],
  };
}

/**
 * Sign an outbound Request made by MealMate's bot/agent using RFC 9421 HTTP Message Signatures
 * and Web Bot Auth `Signature-Agent` / `Signature-Input` / `Signature` headers.
 */
export function signWebBotRequest(request: Request, signatureAgentUrl: string): Request {
  const { privateKey } = getOrCreateBotKeys();
  const url = new URL(request.url);
  const created = Math.floor(Date.now() / 1000);
  const agentHeaderValue = `"${signatureAgentUrl}"`;

  const signatureParams = `("@method" "@target-uri" "@authority" "signature-agent");created=${created};keyid="${KEY_ID}";alg="ed25519";tag="web-bot-auth"`;
  const signatureBase = [
    `"@method": ${request.method.toUpperCase()}`,
    `"@target-uri": ${url.toString()}`,
    `"@authority": ${url.host}`,
    `"signature-agent": ${agentHeaderValue}`,
    `"@signature-params": ${signatureParams}`,
  ].join("\n");

  const signatureBytes = sign(null, Buffer.from(signatureBase, "utf8"), privateKey);
  const headers = new Headers(request.headers);
  headers.set("Signature-Agent", agentHeaderValue);
  headers.set("Signature-Input", `sig1=${signatureParams}`);
  headers.set("Signature", `sig1=:${signatureBytes.toString("base64")}:`);

  return new Request(request, { headers });
}
