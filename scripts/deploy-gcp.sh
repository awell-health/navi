#!/bin/bash

# Simple GCP CDN Deployment for Navi.js
# Deploys to: https://cdn.awellhealth.com/alpha/navi.js
# Usage: ./scripts/deploy-gcp.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BUCKET="gs://navi-js"
CDN_URL="https://cdn.awellhealth.com/beta/navi.js"
NAVI_JS_PATH="packages/navi.js/dist/navi.js"

echo -e "${BLUE}🚀 Deploying navi.js to GCP CDN${NC}"
echo -e "Bucket: ${GREEN}$BUCKET${NC}"
echo -e "CDN URL: ${GREEN}$CDN_URL${NC}"
echo ""

# Check for gcloud CLI
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK not found.${NC}"
    echo "Install from: https://cloud.google.com/sdk"
    exit 1
fi

# Set Python version for Google Cloud SDK
if [ -z "$CLOUDSDK_PYTHON" ]; then
    # Try to find Python 3.11
    if command -v python3.11 &> /dev/null; then
        export CLOUDSDK_PYTHON=$(which python3.11)
        echo -e "${YELLOW}🐍 Using Python 3.11 for gsutil: $CLOUDSDK_PYTHON${NC}"
    elif command -v python3.10 &> /dev/null; then
        export CLOUDSDK_PYTHON=$(which python3.10)
        echo -e "${YELLOW}🐍 Using Python 3.10 for gsutil: $CLOUDSDK_PYTHON${NC}"
    elif command -v python3.9 &> /dev/null; then
        export CLOUDSDK_PYTHON=$(which python3.9)
        echo -e "${YELLOW}🐍 Using Python 3.9 for gsutil: $CLOUDSDK_PYTHON${NC}"
    else
        echo -e "${RED}❌ No compatible Python version found (3.5-3.11 required)${NC}"
        echo "gsutil requires Python 3.5-3.11. Please install a compatible version."
        exit 1
    fi
fi

# Check if navi.js is built
if [ ! -f "$NAVI_JS_PATH" ]; then
    echo -e "${YELLOW}📦 Building navi.js...${NC}"
    cd packages/navi.js
    NODE_ENV=production pnpm build
    cd ../..
    echo -e "${GREEN}🔄 Version tokens automatically replaced during build${NC}"
fi

# Show build info
BUNDLE_SIZE=$(du -h $NAVI_JS_PATH | cut -f1)
echo -e "${GREEN}📦 Bundle size: $BUNDLE_SIZE${NC}"

# Deploy to GCP bucket
echo -e "${BLUE}📡 Uploading to GCP bucket...${NC}"

gsutil cp $NAVI_JS_PATH $BUCKET/alpha/navi.js

# Set cache headers for development (shorter cache time)
echo -e "${BLUE}⚙️ Setting cache headers...${NC}"
gsutil setmeta -h "Cache-Control:public,max-age=300" $BUCKET/alpha/navi.js
gsutil setmeta -h "Content-Type:application/javascript" $BUCKET/alpha/navi.js

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}🌐 Your navi.js is now available at:${NC}"
echo -e "  ${GREEN}$CDN_URL${NC}"
echo ""
echo -e "${BLUE}🧪 Test the deployment:${NC}"
echo -e "  curl -I $CDN_URL"
echo ""
echo -e "${BLUE}📝 Use in your application:${NC}"
echo -e '  <script src="'$CDN_URL'"></script>'
echo -e '  <script>const navi = Navi("pk_test_demo123");</script>'
echo ""

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s -f -I "$CDN_URL" > /dev/null; then
    echo -e "${GREEN}✅ CDN is accessible!${NC}"
else
    echo -e "${YELLOW}⚠️ CDN not accessible yet. This may be due to:${NC}"
    echo -e "   • DNS not configured for cdn.awellhealth.com"
    echo -e "   • CDN propagation delay (can take 5-15 minutes)"
    echo -e "   • Bucket permissions not set for public access"
    echo ""
    echo -e "${BLUE}🔧 Next steps:${NC}"
    echo -e "   1. Configure DNS: cdn.awellhealth.com → GCP CDN"
    echo -e "   2. Set bucket public access (requires OWNER role)"
    echo -e "   3. Wait for CDN propagation"
    echo ""
    echo -e "${BLUE}🧪 Test direct storage access:${NC}"
    echo -e "   curl -I https://cdn.awellhealth.com/alpha/navi.js"
fi 