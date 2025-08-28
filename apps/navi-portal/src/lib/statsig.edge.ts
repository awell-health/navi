import Statsig, { StatsigEnvironment } from "statsig-node-lite";
import { env } from "@/env";

export const initializeStatsig = async () => {
  if (!env.NEXT_PUBLIC_STATSIG_CLIENT_KEY) {
    throw new Error("Statsig client key is not set");
  }
  const environment: StatsigEnvironment = {
    tier: env.NODE_ENV === "production" ? "production" : "development",
  };
  await Statsig.initialize(env.NEXT_PUBLIC_STATSIG_CLIENT_KEY, { environment });
};
export { Statsig };
