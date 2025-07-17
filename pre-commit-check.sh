#!/bin/bash
# pre-commit-check.sh - A simple script to check code quality before committing to GitHub

echo "🔍 Running GhEHR Pre-Commit Checks..."

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
  echo "📝 You have uncommitted changes:"
  git status --short
  echo ""
fi

# Check for environment files with potential secrets
if git status --porcelain | grep -E '\.env|\.env\.|credentials'; then
  echo "⚠️  WARNING: You appear to be committing environment or credential files:"
  git status --porcelain | grep -E '\.env|\.env\.|credentials'
  echo "🔒 Make sure these don't contain secrets or tokens!"
  echo ""
fi

# Check if node_modules or build directories are being committed
if git status --porcelain | grep -E 'node_modules|build|dist'; then
  echo "⚠️  WARNING: You appear to be committing build artifacts or dependencies:"
  git status --porcelain | grep -E 'node_modules|build|dist'
  echo "These should typically be excluded via .gitignore!"
  echo ""
fi

# Run frontend linting if there are TypeScript/JavaScript changes
if git status --porcelain | grep -E '\.tsx?$|\.jsx?$' | grep -v 'node_modules'; then
  echo "🧹 Running TypeScript/JavaScript linting..."
  
  if [ -d "frontend" ]; then
    cd frontend
    if [ -f "package.json" ]; then
      if grep -q "lint" package.json; then
        echo "Running frontend linting..."
        npm run lint
      else
        echo "No lint script found in frontend/package.json"
      fi
    fi
    cd ..
  fi

  if [ -d "backend" ]; then
    cd backend
    if [ -f "package.json" ]; then
      if grep -q "lint" package.json; then
        echo "Running backend linting..."
        npm run lint
      else
        echo "No lint script found in backend/package.json"
      fi
    fi
    cd ..
  fi
fi

# Check for console.log statements in production code
if git status --porcelain | grep -E '\.tsx?$|\.jsx?$' | grep -v 'node_modules'; then
  CONSOLE_LOGS=$(git diff --cached | grep -n "console.log" | grep -v "// console.log" | grep -v "console.log.debug")
  if [ -n "$CONSOLE_LOGS" ]; then
    echo "⚠️  WARNING: Found console.log statements that may not belong in production:"
    echo "$CONSOLE_LOGS"
    echo ""
  fi
fi

# Check for TODO/FIXME comments in changed files
if git status --porcelain | grep -E '\.tsx?$|\.jsx?$' | grep -v 'node_modules'; then
  TODOS=$(git diff --cached | grep -n "TODO\|FIXME")
  if [ -n "$TODOS" ]; then
    echo "📝 NOTE: Found TODO/FIXME comments in your changes:"
    echo "$TODOS"
    echo "Consider addressing these before finalizing your PR."
    echo ""
  fi
fi

# Check for Ghana-specific features without proper tagging
if git status --porcelain | grep -E '\.tsx?$|\.jsx?$' | grep -v 'node_modules'; then
  GHANA_TERMS=$(git diff --cached | grep -n "ghana\|adinkra\|NHIS\|malaria\|typhoid" | grep -v "\[Ghana\]")
  if [ -n "$GHANA_TERMS" ]; then
    echo "🇬🇭 NOTE: Found Ghana-specific terms without [Ghana] tag in commit message:"
    echo "$GHANA_TERMS"
    echo "Consider using [Ghana] tag in your commit message for clarity."
    echo ""
  fi
fi

echo "✅ Pre-commit check completed"
echo "Remember to follow GhEHR Git guidelines when committing!"
echo "See GITHUB_CONTRIBUTION_GUIDE.md for more information."
