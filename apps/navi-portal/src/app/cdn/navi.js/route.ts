import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Serve the built navi.js file with CDN optimization
    const loaderPath = path.join(
      process.cwd(),
      "../../../packages/navi.js/dist/navi.js"
    );

    if (!fs.existsSync(loaderPath)) {
      return new NextResponse(
        "// navi.js not built. Run: pnpm build --filter=@awell-health/navi-dot-js",
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
        // CDN-optimized headers
        "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        // Compression
        Vary: "Accept-Encoding",
        // Security
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving navi.js from CDN route:", error);
    return new NextResponse("// Error loading navi.js", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }
}
