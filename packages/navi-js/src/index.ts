import { NaviConstructor, NaviLoadOptions } from "./types";
import { loadScript, initNavi, LoadNavi } from "./shared";

let naviPromise: Promise<NaviConstructor | null> | null;
let loadCalled = false;

const getNaviPromise = (
  options?: NaviLoadOptions
): Promise<NaviConstructor | null> => {
  if (naviPromise) {
    if (options?.verbose) {
      console.log("🔍 navi-js: Navi already loaded");
    }
    return naviPromise;
  }
  if (options?.verbose) {
    console.log("🔍 navi-js: loading Navi with options:", options);
  }

  naviPromise = loadScript(options).catch((error) => {
    // clear cache on error
    naviPromise = null;
    return Promise.reject(error);
  });
  return naviPromise;
};

const shouldAutoPreload = (): boolean => {
  // Env-based switch for CI/builds
  if (process.env.NAVI_DISABLE_PRELOAD === "true") return false;

  // Runtime dev flags: if your team is overriding loader behavior, skip preload
  // e.g. set this in your dev HTML before the app boots
  // <script>window.__NAVI_DISABLE_PRELOAD = true</script>
  if (typeof window !== "undefined" && (window as any).__NAVI_DISABLE_PRELOAD) {
    return false;
  }

  return true;
};

if (shouldAutoPreload()) {
  Promise.resolve()
    .then(() => getNaviPromise())
    .catch((error) => {
      if (!loadCalled) {
        console.warn(error);
      }
    });
}

export const loadNavi: LoadNavi = (publishableKey, options) => {
  loadCalled = true;
  const startTime = Date.now();

  // if previous attempts are unsuccessful, will re-load script
  return getNaviPromise(options).then((maybeNavi) => {
    return initNavi(maybeNavi, [publishableKey], startTime, options);
  });
};

// Export types for use in other packages
export type { NaviLoadOptions } from "./types";
