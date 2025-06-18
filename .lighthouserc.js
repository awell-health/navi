const { execSync } = require('child_process');

/**
 * Dynamic Lighthouse CI configuration with real magic token generation
 * This ensures we test the actual /magic/[token] route performance
 */

// Cache the config to avoid regenerating tokens on multiple requires
let cachedConfig = null;

function generateConfig() {
  if (cachedConfig) {
    console.log('🔄 LHCI: Using cached configuration');
    return cachedConfig;
  }

  console.log('🎯 LHCI: Generating magic token for performance testing...');
  
  let testUrl = 'http://localhost:3000/test-magic-link'; // fallback

  try {
    // Generate token using the existing TypeScript script
    const output = execSync('pnpm generate-tokens', { 
      encoding: 'utf8',
      cwd: __dirname 
    });
    
    // Extract the sunrise-health token from the output
    const sunriseMatch = output.match(/🔗 http:\/\/localhost:3000\/magic\/([A-Za-z0-9\-_]+)/g);
    if (sunriseMatch && sunriseMatch[0]) {
      testUrl = sunriseMatch[0].replace('🔗 ', '');
      console.log('📊 LHCI: Using generated token for testing');
      console.log(`🎨 Testing URL: ${testUrl}`);
      console.log('🎨 Theme: sunrise-health (realistic branding load)');
    } else {
      throw new Error('Failed to extract token from generate-secure-tokens output');
    }
  } catch (error) {
    console.error('❌ Failed to generate token for LHCI:', error.message);
    console.log('⚠️  Falling back to test-magic-link endpoint');
  }

  cachedConfig = {
    ci: {
      settings: {
        preset: 'mobile'
      },
      collect: {
        url: [testUrl],
        startServerCommand: 'pnpm run start',
        startServerReadyPattern: 'Ready in',
        startServerReadyTimeout: 30000,
        numberOfRuns: 3,
        staticDistDir: null,
        settings: {
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4
          }
        }
      },
      assert: {
        assertions: {
          'first-contentful-paint': ['error', { maxNumericValue: 1000 }],
          'interactive': ['error', { maxNumericValue: 2500 }],
          'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }]
        }
      },
      upload: {
        target: 'lhci',
        serverBaseUrl: 'https://us-central1-awell-turtle-pond.cloudfunctions.net/lighthouse-audit'
      }
    }
  };

  return cachedConfig;
}

module.exports = generateConfig();