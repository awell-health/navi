"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchComponentsManifest,
  loadActionComponent,
} from "@/lib/extensions/manifest";
import { ExtensionActivityData } from "@awell-health/navi-core";

type ComponentProps = {
  activityDetails: ExtensionActivityData;
  onSubmit: (data: Record<string, unknown>) => void;
};

export function Extension({
  activity,
  disabled = false,
  onSubmit,
}: {
  activity: ExtensionActivityData;
  disabled?: boolean;
  onSubmit?: (data: Record<string, unknown>) => void;
}) {
  const [Component, setComponent] =
    useState<React.ComponentType<ComponentProps> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const componentId: string | null = useMemo(() => {
    return activity?.inputs?.componentKey || null;
  }, [activity]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const manifest = await fetchComponentsManifest();
        if (cancelled) return;
        // Validate and, if needed, try sensible fallbacks against manifest
        const ids = new Set(manifest.components.map((c) => c.id));
        if (!componentId || !ids.has(componentId)) {
          console.warn("Missing extension component id");
          return;
        }
        const Comp = (await loadActionComponent(
          manifest,
          componentId
        )) as React.ComponentType<ComponentProps>;
        if (cancelled) return;
        setComponent(() => Comp);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load extension component"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [componentId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading extension…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive mb-2">
          Failed to load extension component
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    );
  }
  if (!Component) return null;

  const handleSubmit = (data: Record<string, unknown>) => {
    if (disabled) return;
    onSubmit?.(data);
  };

  return <Component activityDetails={activity} onSubmit={handleSubmit} />;
}
