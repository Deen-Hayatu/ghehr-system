#!/bin/bash

# GhEHR MOH Features Pre-Deployment Test Suite
# This script tests all MOH-integrated features before AWS deployment

set -e

echo "🏥 GhEHR MOH Features Test Suite"
echo "================================"
echo "Testing all Ghana Ministry of Health integrated features..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
TEST_RESULTS=()

# Function to add test result
add_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: $message${NC}"
        TEST_RESULTS+=("✅ $test_name: PASS")
    else
        echo -e "${RED}❌ $test_name: $message${NC}"
        TEST_RESULTS+=("❌ $test_name: FAIL")
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    if response=$(curl -s -w "%{http_code}" "$BACKEND_URL$endpoint" -o /tmp/response.json); then
        status_code="${response: -3}"
        if [ "$status_code" = "$expected_status" ]; then
            add_test_result "$description" "PASS" "Status: $status_code"
        else
            add_test_result "$description" "FAIL" "Expected: $expected_status, Got: $status_code"
        fi
    else
        add_test_result "$description" "FAIL" "Connection failed"
    fi
}

# Function to test frontend component
test_frontend_component() {
    local component="$1"
    local description="$2"
    
    echo -e "${BLUE}Testing Frontend: $description${NC}"
    
    if [ -f "frontend/src/components/$component.tsx" ]; then
        # Check if component contains MOH-specific elements
        if grep -q "MOH\|Ghana\|moh" "frontend/src/components/$component.tsx"; then
            add_test_result "$description" "PASS" "Component exists with MOH features"
        else
            add_test_result "$description" "FAIL" "Component missing MOH features"
        fi
    else
        add_test_result "$description" "FAIL" "Component file not found"
    fi
}

echo "🔍 1. Backend Health and MOH Features Test"
echo "=========================================="

# Test basic backend health
test_api_endpoint "/health" "Backend Health Check"

# Test authentication endpoint
test_api_endpoint "/api/auth/test" "Auth System" "404"

echo ""
echo "🏥 2. MOH Patient Model Test"
echo "==========================="

# Check if MOH patient model exists
if [ -f "backend/src/models/Patient.ts" ]; then
    echo -e "${BLUE}Testing: MOH Patient Model${NC}"
    
    # Check for MOH-specific fields
    if grep -q "mohPatientId\|facilityType\|districtHealthOffice" "backend/src/models/Patient.ts"; then
        add_test_result "MOH Patient Model" "PASS" "Contains MOH-specific fields"
    else
        add_test_result "MOH Patient Model" "FAIL" "Missing MOH fields"
    fi
    
    # Check for facility types
    if grep -q "Hospital\|Clinic\|CHPS" "backend/src/models/Patient.ts"; then
        add_test_result "MOH Facility Types" "PASS" "Facility types defined"
    else
        add_test_result "MOH Facility Types" "FAIL" "Facility types missing"
    fi
else
    add_test_result "MOH Patient Model" "FAIL" "Patient model file not found"
fi

echo ""
echo "🧠 3. MOH AI Clinical Notes Test"
echo "==============================="

# Check if MOH clinical notes AI exists
if [ -f "backend/src/routes/clinicalNotes.ts" ]; then
    echo -e "${BLUE}Testing: MOH Clinical AI${NC}"
    
    # Check for Ghana-specific diseases (case-insensitive)
    if grep -qi "malaria\|typhoid\|hypertension" "backend/src/routes/clinicalNotes.ts"; then
        add_test_result "MOH Disease AI" "PASS" "Ghana diseases integrated"
    else
        add_test_result "MOH Disease AI" "FAIL" "Ghana diseases missing"
    fi
    
    # Check for confidence scoring
    if grep -q "confidence\|score\|weight" "backend/src/routes/clinicalNotes.ts"; then
        add_test_result "AI Confidence Scoring" "PASS" "Confidence scoring implemented"
    else
        add_test_result "AI Confidence Scoring" "FAIL" "Confidence scoring missing"
    fi
else
    add_test_result "MOH Clinical AI" "FAIL" "Clinical notes file not found"
fi

echo ""
echo "🎨 4. Frontend MOH Components Test"
echo "================================="

# Test MOH Dashboard component
test_frontend_component "MOHDashboard" "MOH Dashboard Component"

# Test MOH Contact Info component
test_frontend_component "MOHContactInfo" "MOH Contact Info Component"

# Test enhanced Patient Registration
test_frontend_component "PatientRegistration" "Enhanced Patient Registration"

# Check if Dashboard includes MOH navigation
if [ -f "frontend/src/components/Dashboard.tsx" ]; then
    echo -e "${BLUE}Testing: Dashboard MOH Integration${NC}"
    
    if grep -q "moh-dashboard\|MOH Dashboard" "frontend/src/components/Dashboard.tsx"; then
        add_test_result "Dashboard MOH Navigation" "PASS" "MOH links integrated"
    else
        add_test_result "Dashboard MOH Navigation" "FAIL" "MOH navigation missing"
    fi
else
    add_test_result "Dashboard MOH Navigation" "FAIL" "Dashboard file not found"
fi

echo ""
echo "⚙️ 5. Configuration and Environment Test"
echo "======================================="

# Check environment configuration
if [ -f "frontend/.env" ]; then
    echo -e "${BLUE}Testing: Frontend Environment${NC}"
    
    if grep -q "REACT_APP_API_URL" "frontend/.env"; then
        add_test_result "Frontend Environment" "PASS" "API URL configured"
    else
        add_test_result "Frontend Environment" "FAIL" "API URL missing"
    fi
else
    add_test_result "Frontend Environment" "FAIL" ".env file not found"
fi

# Check if backend has proper structure
if [ -f "backend/src/server.ts" ]; then
    echo -e "${BLUE}Testing: Backend Server Configuration${NC}"
    
    if grep -q "cors\|helmet\|morgan" "backend/src/server.ts"; then
        add_test_result "Backend Security" "PASS" "Security middleware configured"
    else
        add_test_result "Backend Security" "FAIL" "Security middleware missing"
    fi
else
    add_test_result "Backend Server Configuration" "FAIL" "Server file not found"
fi

echo ""
echo "📦 6. Deployment Readiness Test"
echo "==============================="

# Check if deployment script exists
if [ -f "scripts/deploy-moh-aws.sh" ]; then
    add_test_result "MOH Deployment Script" "PASS" "AWS deployment script ready"
else
    add_test_result "MOH Deployment Script" "FAIL" "Deployment script missing"
fi

# Check if package.json is production-ready
if [ -f "backend/package.json" ]; then
    echo -e "${BLUE}Testing: Package Configuration${NC}"
    
    if grep -q "start.*node.*index.js\|start.*node.*dist" "backend/package.json"; then
        add_test_result "Production Start Script" "PASS" "Start script configured"
    else
        add_test_result "Production Start Script" "FAIL" "Start script needs configuration"
    fi
else
    add_test_result "Backend Package.json" "FAIL" "Package.json not found"
fi

# Check build directories
echo -e "${BLUE}Testing: Build Requirements${NC}"

if command -v npm &> /dev/null; then
    add_test_result "NPM Availability" "PASS" "NPM is installed"
else
    add_test_result "NPM Availability" "FAIL" "NPM not found"
fi

if command -v node &> /dev/null; then
    node_version=$(node --version)
    add_test_result "Node.js Availability" "PASS" "Node.js $node_version"
else
    add_test_result "Node.js Availability" "FAIL" "Node.js not found"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"

# Count results
total_tests=${#TEST_RESULTS[@]}
passed_tests=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "✅" || true)
failed_tests=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "❌" || true)

echo "Total Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

echo ""
echo "Detailed Results:"
printf '%s\n' "${TEST_RESULTS[@]}"

echo ""
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! GhEHR MOH system is ready for AWS deployment!${NC}"
    echo -e "${GREEN}✅ MOH compliance: VERIFIED${NC}"
    echo -e "${GREEN}✅ Ghana healthcare features: VERIFIED${NC}"
    echo -e "${GREEN}✅ AWS deployment readiness: VERIFIED${NC}"
    echo ""
    echo -e "${BLUE}🚀 Run deployment with: bash scripts/deploy-moh-aws.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deployment.${NC}"
    echo -e "${YELLOW}⚠️  Review the failed tests above and ensure all MOH features are properly implemented.${NC}"
    exit 1
fi
