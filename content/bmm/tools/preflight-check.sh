#!/bin/bash
# =============================================================================
# BMAD-S Pre-Flight Deploy Check
# =============================================================================
# Validates that the project is production-ready BEFORE deploying.
# Run this BEFORE docker-compose build or any deploy script.
#
# Usage: ./scripts/preflight-check.sh [TARGET_URL]
#   TARGET_URL: The public URL/IP where the app will be deployed
#               e.g., ./scripts/preflight-check.sh http://3.248.100.208
#
# Exit codes:
#   0 = All checks passed
#   1 = Critical failures found (do NOT deploy)
#   2 = Warnings found (deploy with caution)
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TARGET_URL="${1:-}"
CRITICAL_FAILURES=0
WARNINGS=0
CHECKS_PASSED=0

header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() {
  echo -e "  ${GREEN}✅ PASS${NC}: $1"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

fail() {
  echo -e "  ${RED}❌ FAIL${NC}: $1"
  echo -e "         ${RED}Fix${NC}: $2"
  CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
}

warn() {
  echo -e "  ${YELLOW}⚠️  WARN${NC}: $1"
  echo -e "         ${YELLOW}Suggestion${NC}: $2"
  WARNINGS=$((WARNINGS + 1))
}

# =============================================================================
# CHECK 0: Target URL provided
# =============================================================================
header "0. Target URL"

if [ -z "$TARGET_URL" ]; then
  fail "No TARGET_URL provided" \
    "Usage: ./scripts/preflight-check.sh http://YOUR_IP_OR_DOMAIN"
  echo ""
  echo -e "${RED}Cannot continue without TARGET_URL. Exiting.${NC}"
  exit 1
else
  pass "Target URL: $TARGET_URL"
fi

# Extract host (remove protocol and trailing slash)
TARGET_HOST=$(echo "$TARGET_URL" | sed 's|https\?://||' | sed 's|/.*||')

# =============================================================================
# CHECK 1: Environment Variables
# =============================================================================
header "1. Environment Variables"

# Check .env file exists
if [ -f ".env" ]; then
  pass ".env file exists"
else
  fail ".env file missing" \
    "Create .env from .env.production.example"
fi

# Check JWT_SECRET
if [ -f ".env" ]; then
  if grep -q "^JWT_SECRET=" .env 2>/dev/null; then
    JWT_VAL=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2-)
    if [ -z "$JWT_VAL" ] || [ "$JWT_VAL" = "your-secret-key-change-me" ] || [ "$JWT_VAL" = "change-me" ]; then
      fail "JWT_SECRET is empty or placeholder" \
        "Set a strong random value: openssl rand -hex 32"
    else
      pass "JWT_SECRET is set (not a placeholder)"
    fi
  else
    fail "JWT_SECRET not defined in .env" \
      "Add JWT_SECRET=\$(openssl rand -hex 32) to .env"
  fi
fi

# Check CORS / FRONTEND_URL
if [ -f ".env" ]; then
  if grep -qE "^(FRONTEND_URL|CORS_ORIGIN)=" .env 2>/dev/null; then
    CORS_VAL=$(grep -E "^(FRONTEND_URL|CORS_ORIGIN)=" .env | head -1 | cut -d'=' -f2-)
    if echo "$CORS_VAL" | grep -q "localhost"; then
      fail "CORS/FRONTEND_URL points to localhost: $CORS_VAL" \
        "Set FRONTEND_URL=$TARGET_URL in .env"
    elif echo "$CORS_VAL" | grep -q "$TARGET_HOST"; then
      pass "CORS/FRONTEND_URL matches target: $CORS_VAL"
    else
      warn "CORS/FRONTEND_URL ($CORS_VAL) may not match target ($TARGET_URL)" \
        "Verify FRONTEND_URL=$TARGET_URL in .env"
    fi
  else
    fail "No CORS/FRONTEND_URL defined in .env" \
      "Add FRONTEND_URL=$TARGET_URL to .env"
  fi
fi

# Check VITE_API_URL in frontend .env
if [ -f "frontend/.env" ]; then
  if grep -q "^VITE_API_URL=" frontend/.env 2>/dev/null; then
    API_URL=$(grep "^VITE_API_URL=" frontend/.env | cut -d'=' -f2-)
    if echo "$API_URL" | grep -q "localhost"; then
      fail "Frontend VITE_API_URL points to localhost: $API_URL" \
        "Set VITE_API_URL=${TARGET_URL}:3000 in frontend/.env"
    else
      pass "Frontend VITE_API_URL: $API_URL"
    fi
  else
    warn "VITE_API_URL not in frontend/.env" \
      "Add VITE_API_URL=${TARGET_URL}:3000 to frontend/.env"
  fi
elif [ -f "frontend/.env.production" ]; then
  pass "frontend/.env.production exists (will be used for build)"
else
  warn "No frontend/.env or .env.production found" \
    "Frontend may build with default (localhost) API URL"
fi

# =============================================================================
# CHECK 2: Docker Configuration
# =============================================================================
header "2. Docker Configuration"

# Check docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
  pass "docker-compose.yml exists"
else
  fail "docker-compose.yml missing" \
    "Create docker-compose.yml with backend + frontend services"
fi

# Check JWT_SECRET is passed to backend container
if [ -f "docker-compose.yml" ]; then
  if grep -q "JWT_SECRET" docker-compose.yml 2>/dev/null; then
    pass "JWT_SECRET is referenced in docker-compose.yml"
  else
    fail "JWT_SECRET not passed to backend container" \
      "Add JWT_SECRET=\${JWT_SECRET} to backend environment in docker-compose.yml"
  fi
fi

# Check CORS variable is passed to backend container
if [ -f "docker-compose.yml" ]; then
  if grep -qE "(FRONTEND_URL|CORS_ORIGIN)" docker-compose.yml 2>/dev/null; then
    pass "CORS variable passed to backend container"
  else
    fail "No CORS/FRONTEND_URL variable in docker-compose.yml" \
      "Add FRONTEND_URL=\${FRONTEND_URL} to backend environment"
  fi
fi

# Check .dockerignore doesn't block .env for frontend
if [ -f "frontend/.dockerignore" ]; then
  if grep -q "^\.env$" frontend/.dockerignore 2>/dev/null; then
    if grep -q "^#.*\.env$\|^# \.env$\|^#\.env$" frontend/.dockerignore 2>/dev/null; then
      pass "frontend/.dockerignore: .env line is commented out"
    else
      fail "frontend/.dockerignore blocks .env files" \
        "Comment out or remove '.env' line in frontend/.dockerignore so VITE_API_URL is available at build time"
    fi
  else
    pass "frontend/.dockerignore does not block .env"
  fi
fi

# Check Dockerfiles exist
for svc in backend frontend; do
  if [ -f "$svc/Dockerfile" ]; then
    pass "$svc/Dockerfile exists"
  else
    fail "$svc/Dockerfile missing" \
      "Create $svc/Dockerfile"
  fi
done

# =============================================================================
# CHECK 3: Security Group / Ports
# =============================================================================
header "3. Port Configuration"

# Check provision script opens required ports
if [ -f "scripts/provision-ec2.sh" ]; then
  MISSING_PORTS=""
  for port in 22 80 3000; do
    if ! grep -q "$port" scripts/provision-ec2.sh 2>/dev/null; then
      MISSING_PORTS="$MISSING_PORTS $port"
    fi
  done
  if [ -z "$MISSING_PORTS" ]; then
    pass "provision-ec2.sh references ports 22, 80, 3000"
  else
    fail "provision-ec2.sh missing port(s):$MISSING_PORTS" \
      "Add Security Group rules for all required ports (22 SSH, 80 HTTP, 3000 API)"
  fi
else
  warn "No scripts/provision-ec2.sh found" \
    "Ensure Security Group opens ports 22, 80, and 3000 manually"
fi

# =============================================================================
# CHECK 4: Secrets Safety
# =============================================================================
header "4. Secrets Safety"

# Check .gitignore includes .env
if [ -f ".gitignore" ]; then
  if grep -q "^\.env$\|^\.env " .gitignore 2>/dev/null; then
    pass ".env is in .gitignore"
  else
    fail ".env is NOT in .gitignore — secrets may be committed" \
      "Add .env to .gitignore"
  fi
fi

# Check for hardcoded secrets in docker-compose
if [ -f "docker-compose.yml" ]; then
  if grep -qE "JWT_SECRET:\s*['\"]?[a-zA-Z0-9]" docker-compose.yml 2>/dev/null; then
    if ! grep -q '${' docker-compose.yml 2>/dev/null; then
      fail "JWT_SECRET appears hardcoded in docker-compose.yml" \
        "Use \${JWT_SECRET} variable reference instead of hardcoded value"
    else
      pass "docker-compose.yml uses variable references (not hardcoded secrets)"
    fi
  else
    pass "No hardcoded secrets detected in docker-compose.yml"
  fi
fi

# Check git remote doesn't contain PAT
if command -v git &>/dev/null && git remote -v 2>/dev/null | grep -q "@"; then
  if git remote -v 2>/dev/null | grep -qE "https://[^@]+@"; then
    warn "Git remote URL contains embedded credentials (PAT)" \
      "Run: git remote set-url origin https://github.com/USER/REPO.git"
  fi
fi

# =============================================================================
# CHECK 5: Architecture Alignment
# =============================================================================
header "5. Architecture Alignment"

ARCH_FILE="_bmad-output/planning-artifacts/architecture.md"
if [ -f "$ARCH_FILE" ]; then
  pass "Architecture document found"

  # Check if deploy scripts match architecture
  if grep -qi "ec2" "$ARCH_FILE" 2>/dev/null; then
    if [ -f "scripts/provision-ec2.sh" ]; then
      pass "EC2 deployment scripts match architecture"
    else
      warn "Architecture says EC2 but no EC2 scripts found" \
        "Verify deployment strategy matches architecture.md"
    fi
  fi

  if grep -qi "fargate\|ecs" "$ARCH_FILE" 2>/dev/null && ! grep -qi "ec2" "$ARCH_FILE" 2>/dev/null; then
    if [ -f "scripts/provision-ec2.sh" ]; then
      warn "Architecture says ECS/Fargate but EC2 scripts found" \
        "Verify deployment strategy matches architecture.md ADRs"
    fi
  fi
else
  warn "No architecture document found at $ARCH_FILE" \
    "Pre-flight cannot verify architecture alignment"
fi

# =============================================================================
# SUMMARY
# =============================================================================
header "PREFLIGHT SUMMARY"

TOTAL=$((CHECKS_PASSED + CRITICAL_FAILURES + WARNINGS))
echo ""
echo -e "  ${GREEN}Passed${NC}:   $CHECKS_PASSED"
echo -e "  ${RED}Failed${NC}:   $CRITICAL_FAILURES"
echo -e "  ${YELLOW}Warnings${NC}: $WARNINGS"
echo -e "  Total:    $TOTAL checks"
echo ""

if [ "$CRITICAL_FAILURES" -gt 0 ]; then
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}  ❌ PREFLIGHT FAILED — DO NOT DEPLOY${NC}"
  echo -e "${RED}  Fix $CRITICAL_FAILURES critical issue(s) before deploying.${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  ⚠️  PREFLIGHT PASSED WITH WARNINGS${NC}"
  echo -e "${YELLOW}  Review $WARNINGS warning(s) before deploying.${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 2
else
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ✅ PREFLIGHT PASSED — READY TO DEPLOY${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
fi
