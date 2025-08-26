export async function discoverSmartConfiguration(iss: string): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
}> {
  const base = iss.replace(/\/$/, "");
  const wellKnownUrls = [
    `${base}/.well-known/smart-configuration`,
    `${base}/.well-known/oauth-authorization-server`,
    `${base}/keys`,
  ];
  let lastError: unknown;
  for (const url of wellKnownUrls) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.ok) {
        const json = (await res.json()) as {
          authorization_endpoint?: string;
          token_endpoint?: string;
        };
        if (json.authorization_endpoint && json.token_endpoint) {
          return {
            authorization_endpoint: json.authorization_endpoint,
            token_endpoint: json.token_endpoint,
          };
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `Unable to discover SMART configuration for issuer: ${iss}${
      lastError ? " (" + String(lastError) + ")" : ""
    }`
  );
}
