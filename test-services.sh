#!/bin/bash

# Quick Service Test Script
# Tests if all services are running and responding

echo "🧪 Testing All Services..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Python Chatbot (port 8000)
echo "1. Testing Python Chatbot (port 8000)..."
if curl -s http://localhost:8000/health > /dev/null 2>&1 || curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Python Chatbot is running${NC}"
else
    echo -e "${RED}❌ Python Chatbot is NOT running${NC}"
    echo "   Start it: cd product_listing_app/backend && ./start_chatbot.sh"
fi

# Test Express Backend (port 5001)
echo ""
echo "2. Testing Express Backend (port 5001)..."
if curl -s http://localhost:5001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Express Backend is running${NC}"
    
    # Test products endpoint
    echo "   Testing /api/product endpoint..."
    response=$(curl -s http://localhost:5001/api/product)
    if echo "$response" | grep -q "products\|success"; then
        echo -e "${GREEN}   ✅ Products API working${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Products API returned unexpected response${NC}"
    fi
else
    echo -e "${RED}❌ Express Backend is NOT running${NC}"
    echo "   Start it: cd product_listing_app/backend && npm run dev"
fi

# Test Next.js Frontend (port 3000)
echo ""
echo "3. Testing Next.js Frontend (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js Frontend is running${NC}"
else
    echo -e "${RED}❌ Next.js Frontend is NOT running${NC}"
    echo "   Start it: cd product_listing_app && npm run dev"
fi

echo ""
echo "📋 Next Steps:"
echo "   - Open http://localhost:3000 in your browser"
echo "   - Test features according to TESTING_GUIDE.md"
echo "   - Check browser console for any errors"

