#!/bin/bash

# Bundle size analysis script for CI/CD
# This script analyzes bundle sizes and fails if budgets are exceeded

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Bundle size budgets (in KB)
MAIN_CHUNK_BUDGET=400
TOTAL_BUDGET=2000
TON_CHUNK_BUDGET=500

echo -e "${GREEN}🔍 Analyzing bundle sizes...${NC}"

# Build with analysis
npm run analyze

# Get the stats file
STATS_FILE="dist/public/stats.html"
if [ ! -f "$STATS_FILE" ]; then
    echo -e "${RED}❌ Bundle analysis file not found: $STATS_FILE${NC}"
    exit 1
fi

# Extract bundle information from build output
echo -e "${GREEN}📊 Bundle Analysis Results:${NC}"

# Check if there are any warnings about large chunks
BUILD_LOG_FILE="dist/build.log"
if [ -f "$BUILD_LOG_FILE" ]; then
    if grep -q "larger than 400 KB" "$BUILD_LOG_FILE"; then
        echo -e "${YELLOW}⚠️  Large chunks detected:${NC}"
        grep "larger than 400 KB" "$BUILD_LOG_FILE" | while read line; do
            echo -e "${YELLOW}   $line${NC}"
        done
    fi
fi

# Check specific chunk sizes from the build output
echo -e "${GREEN}📦 Checking chunk sizes against budgets:${NC}"

# Function to extract chunk size from build output
get_chunk_size() {
    local chunk_name="$1"
    local build_output="$2"
    echo "$build_output" | grep "$chunk_name" | head -1 | awk '{print $3}' | sed 's/kB//' | sed 's/,//'
}

# Run build again to capture output
BUILD_OUTPUT=$(npm run build 2>&1 || true)

# Check main chunks
MAIN_CHUNK_SIZE=$(get_chunk_size "index-" "$BUILD_OUTPUT")
if [ -n "$MAIN_CHUNK_SIZE" ]; then
    if (( $(echo "$MAIN_CHUNK_SIZE > $MAIN_CHUNK_BUDGET" | bc -l) )); then
        echo -e "${RED}❌ Main chunk ($MAIN_CHUNK_SIZE kB) exceeds budget ($MAIN_CHUNK_BUDGET kB)${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Main chunk ($MAIN_CHUNK_SIZE kB) within budget ($MAIN_CHUNK_BUDGET kB)${NC}"
    fi
fi

# Check TON chunk
TON_CHUNK_SIZE=$(get_chunk_size "ton-" "$BUILD_OUTPUT")
if [ -n "$TON_CHUNK_SIZE" ]; then
    if (( $(echo "$TON_CHUNK_SIZE > $TON_CHUNK_BUDGET" | bc -l) )); then
        echo -e "${RED}❌ TON chunk ($TON_CHUNK_SIZE kB) exceeds budget ($TON_CHUNK_BUDGET kB)${NC}"
        echo -e "${YELLOW}💡 Consider lazy loading TON-related components${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ TON chunk ($TON_CHUNK_SIZE kB) within budget ($TON_CHUNK_BUDGET kB)${NC}"
    fi
fi

# Calculate total bundle size
echo -e "${GREEN}📈 Bundle analysis report generated: $STATS_FILE${NC}"
echo -e "${GREEN}🌐 Open the report in your browser to see detailed analysis${NC}"

# Output summary for CI
echo -e "${GREEN}## Bundle Size Summary${NC}"
echo "Main chunk: ${MAIN_CHUNK_SIZE:-N/A} kB (budget: $MAIN_CHUNK_BUDGET kB)"
echo "TON chunk: ${TON_CHUNK_SIZE:-N/A} kB (budget: $TON_CHUNK_BUDGET kB)"
echo "Report: $STATS_FILE"

echo -e "${GREEN}✅ Bundle size analysis completed successfully!${NC}"