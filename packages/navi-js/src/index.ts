import { NaviConstructor } from './types';
import { loadScript, initNavi, LoadNavi } from './shared';

let naviPromise: Promise<NaviConstructor | null> | null;
let loadCalled = false;

const getNaviPromise = (): Promise<NaviConstructor | null> => {
  if (naviPromise) {
    return naviPromise;
  }

  naviPromise = loadScript().catch((error) => {
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

export const loadNavi: LoadNavi = (...args) => {
  loadCalled = true;
  const startTime = Date.now();

  // if previous attempts are unsuccessful, will re-load script
  return getNaviPromise().then((maybeNavi) =>
    initNavi(maybeNavi, args, startTime)
  );
}; 