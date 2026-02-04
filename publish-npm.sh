#!/bin/bash
# NPM Publishing Script for ngx2excel
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
echo "=========================================="
echo "ngx2excel NPM Publishing"
echo "=========================================="
echo ""
# Check login
echo -e "${YELLOW}Checking npm login...${NC}"
if ! npm whoami > /dev/null 2>&1; then
    echo -e "${RED}Error: Not logged in${NC}"
    echo "Run: npm login"
    exit 1
fi
echo -e "${GREEN}✓ Logged in${NC}"
echo ""
# Clean and build
echo -e "${YELLOW}Building library...${NC}"
rm -rf dist/ngx2excel
npm run build:lib
echo -e "${GREEN}✓ Build complete${NC}"
echo ""
# Get version
VERSION=$(node -p "require('./projects/ngx2excel/package.json').version")
echo -e "${YELLOW}Publishing v${VERSION}${NC}"
echo ""
# Confirm
read -p "Continue? (yes/no) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi
echo ""
# Publish
echo -e "${YELLOW}Publishing...${NC}"
cd dist/ngx2excel
npm publish
cd ../..
echo -e "${GREEN}✓ Published!${NC}"
echo ""
echo "=========================================="
echo "Done! Version: v${VERSION}"
echo "=========================================="
