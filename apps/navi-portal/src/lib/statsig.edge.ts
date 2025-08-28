import Statsig, { StatsigEnvironment } from "statsig-node-lite";
import { env } from "@/env";

export const initializeStatsig = async () => {
  if (!env.STATSIG_SERVER_KEY) {
    throw new Error("Statsig client key is not set");
  }
  const environment: StatsigEnvironment = {
    tier: env.NODE_ENV === "production" ? "production" : "development",
  };
  await Statsig.initialize(env.STATSIG_SERVER_KEY, { environment });
};
export { Statsig };
