import { env } from "@/env";
import { StatsigClient, StatsigUser } from "@statsig/js-client";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";

let myStatsigClient: StatsigClient | null = null;

export const initializeStatsig = async (user?: Partial<StatsigUser>) => {
  if (!env.NEXT_PUBLIC_STATSIG_CLIENT_KEY) {
    console.warn("Statsig client key is not set, skipping initialization");
    return;
  }
  myStatsigClient = new StatsigClient(
    env.NEXT_PUBLIC_STATSIG_CLIENT_KEY,
    { ...user },
    {
      plugins: [
        new StatsigSessionReplayPlugin(),
        new StatsigAutoCapturePlugin(),
      ],
    }
  );
  await myStatsigClient.initializeAsync();
};

export const getStatsig = (): StatsigClient => {
  if (!myStatsigClient) {
    throw new Error("Statsig not initialized");
  }
  return myStatsigClient;
};
