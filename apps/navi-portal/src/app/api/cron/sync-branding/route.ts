import { NextRequest, NextResponse } from "next/server";
import { brandingStore } from "@/lib/branding/storage/kv-store";
import { edgeConfigBrandingStore } from "@/lib/branding/storage/edge-store";
import { kv } from "@vercel/kv";
import { validateBranding } from "@/lib/branding/theme/validator";
import { generateThemeCSS } from "@/lib/branding/theme/generator";

/**
 * Vercel Cron Job: Sync KV Store → Edge Config
 *
 * Runs daily to sync all organization branding from KV store to Edge Config
 * Ensures production reads are fast (<20ms) while maintaining data freshness
 *
 * Called by Vercel Cron: POST /api/cron/sync-branding
 */

export async function POST(request: NextRequest) {
  console.log("🕐 Branding sync cron job started");

  // Verify this is a legitimate cron request
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("❌ Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const syncResults = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Get all branding keys from KV store
    const keys = await kv.keys("branding:*");
    console.log(`🔍 Found ${keys.length} branding entries in KV store`);

    syncResults.total = keys.length;

    // Process each organization
    for (const key of keys) {
      const orgId = key.replace("branding:", "");

      try {
        console.log(`🔄 Processing org: ${orgId}`);

        // Get branding data from KV
        const branding = await brandingStore.get(orgId);

        if (!branding) {
          console.log(`⏭️ Skipping ${orgId}: no branding data`);
          syncResults.skipped++;
          continue;
        }

        // Validate branding data
        const validation = validateBranding(branding);
        if (!validation.success) {
          console.warn(`⚠️ Invalid branding for ${orgId}:`, validation.error);
          syncResults.failed++;
          syncResults.errors.push(
            `${orgId}: Invalid branding - ${validation.error}`
          );
          continue;
        }

        // Generate CSS to verify everything works
        generateThemeCSS(branding);

        // Update Edge Config using existing store
        await edgeConfigBrandingStore.set(orgId, branding);

        console.log(`✅ Successfully synced ${orgId}`);
        syncResults.success++;
      } catch (orgError) {
        console.error(`❌ Failed to sync ${orgId}:`, orgError);
        syncResults.failed++;
        syncResults.errors.push(`${orgId}: ${String(orgError)}`);
      }
    }

    const duration = Date.now() - startTime;

    // Log final results
    console.log("📊 Sync Summary:");
    console.log(`  Total: ${syncResults.total}`);
    console.log(`  Success: ${syncResults.success}`);
    console.log(`  Failed: ${syncResults.failed}`);
    console.log(`  Skipped: ${syncResults.skipped}`);
    console.log(`  Duration: ${duration}ms`);

    if (syncResults.failed > 0) {
      console.error("❌ Sync completed with errors:", syncResults.errors);
    }

    return NextResponse.json({
      success: true,
      summary: {
        ...syncResults,
        duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Sync job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
        summary: {
          ...syncResults,
          duration,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for manual testing
export async function GET() {
  return NextResponse.json({
    message: "Branding sync cron endpoint",
    usage: "POST /api/cron/sync-branding",
    note: "This endpoint is called automatically by Vercel Cron",
  });
}
