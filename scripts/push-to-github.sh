#!/bin/bash

# Replace 'your-repo-name' with your actual repository name
REPO_NAME="ghehr-system"  # Change this to your actual repo name

echo "🚀 Pushing GhEHR to GitHub..."
echo "Make sure you've created the repository on GitHub first!"
echo ""

# Add remote origin
git remote add origin https://github.com/Deen-Hayatu/${REPO_NAME}.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Repository URL: https://github.com/Deen-Hayatu/${REPO_NAME}"
