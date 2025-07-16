import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Serve the built navi.js file with versioned CDN headers
    const loaderPath = path.join(
      process.cwd(),
      "../../../packages/navi.js/dist/navi.js"
    );

    if (!fs.existsSync(loaderPath)) {
      return new NextResponse(
        "// navi.js v1 not built. Run: pnpm build --filter=@awell-health/navi-dot-js",
        {
          status: 404,
          headers: {
            "Content-Type": "application/javascript",
          },
        }
      );
    }

    const content = fs.readFileSync(loaderPath, "utf8");

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        // Versioned CDN headers (shorter cache for latest)
        "Cache-Control": "public, max-age=3600, s-maxage=86400", // 1 hour browser, 1 day CDN
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        // Version info
        "X-Navi-Version": "v1",
        "X-Content-Type-Options": "nosniff",
        // Compression support
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    console.error("Error serving navi.js v1:", error);
    return new NextResponse("// Error loading navi.js v1", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }
}
