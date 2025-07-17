# GhEHR Git Workflow Guidelines

## Overview

This document outlines the recommended Git workflow for the GhEHR project. Following these practices will help maintain code quality and facilitate collaboration.

## Branch Strategy

### Main Branches

- **`main`** - The production-ready branch. Should always be stable and deployable.
- **`development`** - Integration branch for features. Slightly ahead of `main`.

### Supporting Branches

- **Feature Branches** - For developing new features
  - Naming: `feature/feature-name`
  - Example: `feature/patient-search`

- **Bug Fix Branches** - For fixing bugs
  - Naming: `fix/bug-description`
  - Example: `fix/login-token-issue`

- **Enhancement Branches** - For enhancing existing features
  - Naming: `enhance/feature-name`
  - Example: `enhance/ai-analysis`

- **Hotfix Branches** - For critical production fixes
  - Naming: `hotfix/issue-description`
  - Example: `hotfix/security-vulnerability`

## Workflow

### Starting a New Feature

1. Always start from the latest `development` branch:
   ```bash
   git checkout development
   git pull origin development
   ```

2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make changes and commit frequently:
   ```bash
   git add .
   git commit -m "Meaningful description of changes"
   ```

### Committing Code

Good commit messages are crucial. Follow this format:

```
[Component] Brief summary of change

More detailed description explaining:
- Why the change was made
- Any important implementation details
- References to requirements or issues
```

Examples:
- `[PatientManagement] Add NHIS verification feature`
- `[ClinicalNotes] Fix symptom extraction for local terms`

### Before Pushing Changes

1. Make sure your code passes all local tests:
   ```bash
   # Run backend tests
   cd backend && npm test
   
   # Run frontend tests
   cd frontend && npm test
   ```

2. Ensure code formatting standards are met:
   ```bash
   # For backend
   cd backend && npm run lint
   
   # For frontend
   cd frontend && npm run lint
   ```

3. Update your branch with the latest changes from development:
   ```bash
   git checkout development
   git pull origin development
   git checkout feature/your-feature-name
   git merge development
   ```

4. Resolve any merge conflicts and verify functionality still works

### Pushing and Pull Requests

1. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request (PR) to merge into `development`
   - Provide a clear description of the changes
   - Reference any related issues
   - Add necessary reviewers

3. After approval, merge into `development`

4. Once `development` is stable and features are complete, create a PR from `development` to `main` for production release

## Commit Frequency

- Commit frequently but logically
- Each commit should:
  - Address a single concern
  - Not break the build
  - Include related tests

## Working with the Existing GitHub Repository

Since the GhEHR project is already hosted on GitHub, follow these guidelines for your local development workflow:

### Initial Setup

1. If you haven't already cloned the repository:
   ```bash
   git clone https://github.com/your-organization/ghehr.git
   cd ghehr
   ```

2. Set up tracking for remote branches:
   ```bash
   git fetch --all
   ```

### Daily Development Workflow

1. Always pull the latest changes before starting work:
   ```bash
   # If working on development branch
   git checkout development
   git pull origin development
   
   # If working on a feature branch
   git checkout feature/your-feature
   git pull origin feature/your-feature
   ```

2. Regularly push your changes to the remote repository:
   ```bash
   git push origin feature/your-feature
   ```
   This ensures your work is backed up and visible to other team members.

### Local Development Changes

Yes, you **should** commit your local development changes to GitHub when:
- You've completed a logical unit of work
- You've fixed a bug or implemented a feature
- You want to share your work with team members
- You want to back up your progress

However, follow these best practices:

1. **Commit on feature branches, not directly on main/development**:
   - Always create feature branches for your work
   - Keep commits focused and related to a single concern

2. **Be mindful of what you commit**:
   - Don't commit build artifacts, node_modules, or other generated files
   - Don't commit environment-specific configuration files with secrets
   - Use the project's .gitignore to exclude the right files

3. **Clean up before pushing**:
   - Remove debug log statements
   - Clean up commented code
   - Run linters and tests before pushing

4. **Use meaningful commit messages**:
   - Follow the project's commit message format
   - Reference issue numbers when applicable

### Synchronizing with the Team

Regular synchronization helps prevent conflicts:

1. Pull from the remote regularly:
   ```bash
   git pull origin feature/your-feature
   ```

2. Rebase your feature branch on development to incorporate team changes:
   ```bash
   git checkout development
   git pull origin development
   git checkout feature/your-feature
   git rebase development
   ```

3. Resolve any conflicts during the rebase

### When NOT to Push to GitHub

Avoid pushing to GitHub when:
- The code doesn't compile or tests are failing
- You're in the middle of a complex change
- You've added temporary workarounds you don't want to share
- You've included sensitive data or credentials

In these cases, continue making local commits but wait to push until the code is in a good state.

## Special Considerations for GhEHR

### Sensitive Data

- **NEVER** commit sensitive data:
  - Patient information
  - API keys
  - JWT secrets
  - Database credentials
  - Production environment variables

- Use `.env` files and `.gitignore` to manage environment-specific configuration

### Ghana-Specific Features

- When committing changes to Ghana-specific features (like the Medical NLP system):
  - Tag commits with `[Ghana]` prefix
  - Document any cultural or regional considerations in the commit message
  - Include references to Ghana MOH requirements if applicable

## Deployment Process

1. After thorough testing in the local environment, merge `development` into `main`
2. Create a Git tag for the release:
   ```bash
   git tag -a v1.x.x -m "Version 1.x.x - Brief description"
   git push origin v1.x.x
   ```
3. Follow the deployment protocol to push to production

## Working with Large Changes

For large features that might take multiple days:
1. Break down the work into smaller, logical commits
2. Push your branch daily to ensure work is backed up
3. Use `[WIP]` prefix in commit messages for incomplete work
4. Rebase and clean up commits before creating the final PR

Remember: Git is for tracking meaningful changes, not just saving work. Structure your commits to tell the story of how the feature evolved.
