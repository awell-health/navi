import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Serve the built JavaScript file from tsup
    const loaderPath = path.join(process.cwd(), '../../packages/navi-loader/dist/src/index.js');
    
    // Check if the built file exists
    if (!fs.existsSync(loaderPath)) {
      return new NextResponse('// Navi loader not built. Run: turbo build --filter=@awell-health/navi-loader\n// Looking for: ' + loaderPath, {
        status: 404,
        headers: {
          'Content-Type': 'application/javascript'
        }
      });
    }
    
    const content = fs.readFileSync(loaderPath, 'utf8');
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error serving navi-loader.js:', error);
    return new NextResponse('// Error loading navi-loader.js', {
      status: 500,
      headers: {
        'Content-Type': 'application/javascript'
      }
    });
  }
} 