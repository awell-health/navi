import { NaviConstructor, NaviLoadOptions } from "./types";
import { loadScript, initNavi, LoadNavi } from "./shared";

let naviPromise: Promise<NaviConstructor | null> | null;
let loadCalled = false;

const getNaviPromise = (
  options?: NaviLoadOptions
): Promise<NaviConstructor | null> => {
  if (naviPromise) {
    return naviPromise;
  }

  naviPromise = loadScript(options).catch((error) => {
    // clear cache on error
    naviPromise = null;
    return Promise.reject(error);
  });
  return naviPromise;
};

// Execute our own script injection after a tick to give users time to do their
// own script injection.
Promise.resolve()
  .then(() => getNaviPromise())
  .catch((error) => {
    if (!loadCalled) {
      console.warn(error);
    }
  });

export const loadNavi: LoadNavi = (publishableKey, options) => {
  loadCalled = true;
  const startTime = Date.now();

  // if previous attempts are unsuccessful, will re-load script
  return getNaviPromise(options).then((maybeNavi) =>
    initNavi(maybeNavi, [publishableKey], startTime, options)
  );
};

// Export types for use in other packages
export type { NaviLoadOptions } from "./types";
