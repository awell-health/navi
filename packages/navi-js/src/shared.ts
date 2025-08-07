import { Navi, NaviConstructor, NaviLoadOptions } from "./types";

export type LoadNavi = (
  publishableKey: string,
  options?: NaviLoadOptions
) => Promise<Navi | null>;

// `_VERSION` will be rewritten by `@rollup/plugin-replace` as a string literal
// containing the package.json version
declare const _VERSION: string;

// CDN configuration - GCP Cloud CDN
const getCDNConfig = (options?: NaviLoadOptions) => {
  let origin = "https://cdn.awellhealth.com";
  let embedOrigin = "https://navi-portal.awellhealth.com";

  // Apply environment variables
  if (
    typeof process !== "undefined" &&
    process.env.EMBED_ORIGIN !== undefined
  ) {
    embedOrigin = process.env.EMBED_ORIGIN;
  }

  if (typeof process !== "undefined" && process.env.ORIGIN !== undefined) {
    origin = process.env.ORIGIN;
  }

  // Apply explicit options (highest priority)
  if (options?.origin) {
    origin = options.origin;
  }

  if (options?.embedOrigin) {
    embedOrigin = options.embedOrigin;
  }

  return {
    origin,
    embedOrigin,
  };
};

// Development: alpha version for testing
// Production: will use versioned URLs later
const getNaviJSUrl = (options?: NaviLoadOptions) => {
  const config = getCDNConfig(options);
  return `${config.origin}/alpha/navi.js`;
};

// Updated regex patterns for GCP CDN
const PRODUCTION_CDN_REGEX =
  /^https:\/\/cdn\.awellhealth\.com\/(alpha|v\d+.*\/)?navi\.js(\?.*)?$/;
const LOCALHOST_REGEX = /^http:\/\/localhost:3000\/(v1\/)?navi\.js(\?.*)?$/;

const isNaviJSURL = (url: string): boolean =>
  PRODUCTION_CDN_REGEX.test(url) || LOCALHOST_REGEX.test(url);

export { isNaviJSURL, getNaviJSUrl, getCDNConfig };

export const findScript = (): HTMLScriptElement | null => {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[src*="navi.js"]'
  );

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];

    if (!isNaviJSURL(script.src)) {
      continue;
    }

    return script;
  }

  return null;
};

const injectScript = (options?: NaviLoadOptions): HTMLScriptElement => {
  const script = document.createElement("script");
  script.src = getNaviJSUrl(options);

  const headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error(
      "Expected document.body not to be null. Navi.js requires a <body> element."
    );
  }

  headOrBody.appendChild(script);

  return script;
};

let naviPromise: Promise<NaviConstructor | null> | null = null;
let onErrorListener: ((event?: Event) => void) | null = null;
let onLoadListener: (() => void) | null = null;

const onError =
  (reject: (reason?: any) => void, scriptUrl: string) => (event?: Event) => {
    const errorDetails = event
      ? `Script load error for ${scriptUrl}. Check network connection and URL.`
      : `Unknown error loading ${scriptUrl}`;

    reject(new Error(`Failed to load Navi.js: ${errorDetails}`));
  };

const onLoad =
  (
    resolve: (
      value: NaviConstructor | PromiseLike<NaviConstructor | null> | null
    ) => void,
    reject: (reason?: any) => void
  ) =>
  () => {
    if (window.Navi) {
      resolve(window.Navi);
    } else {
      reject(new Error("Navi.js not available"));
    }
  };

export const loadScript = (
  options?: NaviLoadOptions
): Promise<NaviConstructor | null> => {
  naviPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    try {
      let script = findScript();
      const desiredUrl = getNaviJSUrl(options);

      // If a script already exists and its src matches desired, reuse it
      if (script && script.src === desiredUrl && !options?.alwaysFetch) {
        if (window.Navi) {
          resolve(window.Navi);
          return;
        }
      } else {
        // No script, or src differs, or forced fetch → inject fresh script
        if (script) {
          script.parentNode?.removeChild(script);
        }
        script = injectScript(options);
      }

      onLoadListener = onLoad(resolve, reject);
      onErrorListener = onError(reject, script.src);
      script.addEventListener("load", onLoadListener);
      script.addEventListener("error", onErrorListener);
    } catch (error) {
      reject(error);
      return;
    }
  });

  // Resets naviPromise on error
  return naviPromise.catch((error) => {
    naviPromise = null;
    return Promise.reject(error);
  });
};

export const initNavi = (
  maybeNavi: NaviConstructor | null,
  args: [string], // publishableKey
  startTime: number,
  options?: NaviLoadOptions
): Navi | null => {
  if (maybeNavi === null) {
    return null;
  }

  const publishableKey = args[0];
  const isTestKey = publishableKey.match(/^pk_test/);

  if (isTestKey && options?.verbose) {
    console.log(`🚀 Navi.js loaded using test key: ${publishableKey}`);
  }

  // Convert navi-js options to navi.js options format
  const naviJsOptions = options
    ? {
        ...getCDNConfig(options),
        verbose: options.verbose,
        alwaysFetch: options.alwaysFetch,
      }
    : undefined;

  const navi = maybeNavi(publishableKey, naviJsOptions);
  return navi;
};
