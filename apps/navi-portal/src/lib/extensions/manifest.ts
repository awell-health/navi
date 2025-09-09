import React from "react";
import ReactDOM from "react-dom";
import { createInstance, registerPlugins } from "@module-federation/runtime";

type MinimalFederationInstance = {
  loadRemote: (id: string) => Promise<unknown>;
};

const instanceCache = new Map<string, MinimalFederationInstance>();

export type ComponentId = string;

export type ComponentSpec = {
  id: ComponentId;
  expose: string;
};

export type ComponentsManifest = {
  remoteName: string;
  remoteEntryUrl: string;
  version: string;
  components: ComponentSpec[];
};

export type ActionComponent<Props extends object = Record<string, unknown>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: Props) => any;

async function ensureRuntimeInitialized(
  manifest: ComponentsManifest
): Promise<MinimalFederationInstance> {
  // Guard against repeated initialization for this remote
  const key = `${manifest.remoteName}|${manifest.remoteEntryUrl}`;
  const cached = instanceCache.get(key);
  if (cached) return cached;
  console.log("👤 manifest", manifest);
  const mfInstance = createInstance({
    name: "naviPortal",
    remotes: [
      {
        name: manifest.remoteName,
        entry: manifest.remoteEntryUrl,
      },
    ],
    shared: {
      react: {
        version: (React as unknown as { version?: string }).version || "19.1.1",
        lib: () => React,
        strategy: "loaded-first",
        shareConfig: { singleton: true, requiredVersion: false },
      },
      "react-dom": {
        version:
          (ReactDOM as unknown as { version?: string }).version || "19.1.1",
        lib: () => ReactDOM,
        strategy: "loaded-first",
        shareConfig: { singleton: true, requiredVersion: false },
      },
    },
  });
  instanceCache.set(key, mfInstance as unknown as MinimalFederationInstance);
  return mfInstance as unknown as MinimalFederationInstance;
}

export async function loadActionComponent(
  manifest: ComponentsManifest,
  componentId: ComponentId
): Promise<ActionComponent> {
  const spec = manifest.components.find((c) => c.id === componentId);
  if (!spec) throw new Error(`Unknown component: ${componentId}`);

  const mf = await ensureRuntimeInitialized(manifest);
  const exposePath = spec.expose.startsWith("./")
    ? spec.expose.slice(2)
    : spec.expose.replace(/^\.\//, "");
  console.log("👤 exposePath", exposePath);
  console.log("👤 manifest.remoteName", manifest.remoteName);
  const mod = (await mf.loadRemote(`${manifest.remoteName}/${exposePath}`)) as {
    default: ActionComponent;
  };
  return mod.default as ActionComponent;
}

import { getCurrentTokenEnvironment } from "@/lib/awell-client/client";

function mapEnvironmentToExtensionBase(environment: string | null): string {
  switch (environment) {
    case "local":
    case "test":
      return "http://extensions.development.awellhealth.com";
    case "development":
      return "https://extensions.development.awellhealth.com";
    case "staging":
      return "https://extensions.staging.awellhealth.com";
    case "production-eu":
      return "https://extensions.awellhealth.com";
    case "production-us":
      return "https://extensions.us.awellhealth.com";
    case "production-uk":
      return "https://extensions.uk.awellhealth.com";
    case "sandbox":
      return "https://extensions.sandbox.awellhealth.com";
    default:
      return "https://extensions.development.awellhealth.com";
  }
}

export async function fetchComponentsManifest(): Promise<ComponentsManifest> {
  const env = await getCurrentTokenEnvironment();
  const base = mapEnvironmentToExtensionBase(env);
  const res = await fetch(`${base}/v2/components/manifest`, {
    cache: "no-store",
  });
  if (!res.ok)
    throw new Error(`Failed to fetch components manifest: ${res.status}`);
  const manifest = (await res.json()) as ComponentsManifest;
  // Normalize remoteEntryUrl (server can return relative path)
  try {
    const absolute = new URL(manifest.remoteEntryUrl, base).href;
    return { ...manifest, remoteEntryUrl: absolute };
  } catch {
    return manifest;
  }
}
