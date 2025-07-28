import { NaviLoader } from "./navi-loader";
import { NaviLoadOptions, NaviInstance } from "./types";

// Initialize when script loads
(() => {
  // Prevent double loading
  if ((window as any).Navi) {
    return;
  }

  // Create global Navi function
  const loader = new NaviLoader();

  (window as any).Navi = function (
    publishableKey: string,
    options?: NaviLoadOptions
  ): NaviInstance {
    if (!publishableKey || !publishableKey.startsWith("pk_")) {
      throw new Error('Invalid publishable key. Must start with "pk_"');
    }

    return loader.createNavi(publishableKey, options);
  };

  // Add version and debug info
  (window as any).Navi.version = "1.0.0-poc";
  (window as any).Navi.debug = () => {
    console.debug("🚀 Navi Loader initialized with Turborepo");
    console.debug("📊 Active instances:", (loader as any).instances.size);
  };

  console.log("🚀 Navi Loader ready");
})();
