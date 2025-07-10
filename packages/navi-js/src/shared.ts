import { Navi, NaviConstructor } from "./types";

export type LoadNavi = (publishableKey: string) => Promise<Navi | null>;

// `_VERSION` will be rewritten by `@rollup/plugin-replace` as a string literal
// containing the package.json version
declare const _VERSION: string;

// CDN configuration - environment aware
const getCDNConfig = () => {
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    return {
      origin: "http://localhost:3000",
      embedOrigin: "http://localhost:3000",
    };
  }

  return {
    origin: "https://cdn.navi.com",
    embedOrigin: "https://embed.navi.com",
  };
};

const config = getCDNConfig();
const NAVI_JS_URL = `${config.origin}/v1/navi-loader.js`;

const NAVI_JS_URL_REGEX =
  /^https:\/\/cdn\.navi\.com\/v\d+\/navi-loader\.js(\?.*)?$/;
const LOCALHOST_REGEX = /^http:\/\/localhost:3000\/navi-loader\.js(\?.*)?$/;

const isNaviJSURL = (url: string): boolean =>
  NAVI_JS_URL_REGEX.test(url) || LOCALHOST_REGEX.test(url);

export const findScript = (): HTMLScriptElement | null => {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[src*="navi-loader.js"]'
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

const injectScript = (): HTMLScriptElement => {
  const script = document.createElement("script");
  script.src = NAVI_JS_URL;

  const headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error(
      "Expected document.body not to be null. Navi.js requires a <body> element."
    );
  }

  headOrBody.appendChild(script);

  return script;
};

const registerWrapper = (navi: any, startTime: number): void => {
  if (!navi || !navi._registerWrapper) {
    return;
  }

  navi._registerWrapper({
    name: "navi-js",
    version: _VERSION,
    startTime,
  });
};

let naviPromise: Promise<NaviConstructor | null> | null = null;
let onErrorListener: ((cause?: unknown) => void) | null = null;
let onLoadListener: (() => void) | null = null;

const onError = (reject: (reason?: any) => void) => (cause?: unknown) => {
  reject(new Error(`Failed to load Navi.js: ${JSON.stringify(cause)}`));
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

export const loadScript = (): Promise<NaviConstructor | null> => {
  // Ensure that we only attempt to load Navi.js at most once
  if (naviPromise !== null) {
    return naviPromise;
  }

  naviPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    if (window.Navi) {
      resolve(window.Navi);
      return;
    }

    try {
      let script = findScript();

      if (!script) {
        script = injectScript();
      } else if (
        script &&
        onLoadListener !== null &&
        onErrorListener !== null
      ) {
        // remove event listeners
        script.removeEventListener("load", onLoadListener);
        script.removeEventListener("error", onErrorListener);

        // if script exists, but we are reloading due to an error,
        // reload script to trigger 'load' event
        script.parentNode?.removeChild(script);
        script = injectScript();
      }

      onLoadListener = onLoad(resolve, reject);
      onErrorListener = onError(reject);
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
  startTime: number
): Navi | null => {
  if (maybeNavi === null) {
    return null;
  }

  const publishableKey = args[0];
  const isTestKey = publishableKey.match(/^pk_test/);

  if (isTestKey) {
    console.log("🚀 Navi.js loaded in development mode");
  }

  const navi = maybeNavi(publishableKey);
  registerWrapper(navi, startTime);
  return navi;
};
