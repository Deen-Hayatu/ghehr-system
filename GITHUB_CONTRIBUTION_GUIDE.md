# GhEHR GitHub Contribution Guidelines

## Working with the Existing GitHub Repository

This document outlines best practices for contributing to the GhEHR project, focusing specifically on when and how to commit your local development changes to the shared GitHub repository.

## When to Commit and Push Local Development Changes

### DO Commit and Push:

1. **Feature Implementations**:
   - When you've completed a working feature (even if not fully polished)
   - When you've reached a stable checkpoint in a larger feature

2. **Bug Fixes**:
   - When you've fixed a bug and verified it works
   - Include test cases that reproduce the bug (if applicable)

3. **Refactoring**:
   - Code improvements that don't change functionality
   - Performance enhancements
   - Better organization of code

4. **Documentation**:
   - Updates to README files
   - Code comments
   - Additional guidance documents

5. **Regular Checkpoints**:
   - At the end of each day if working on a longer feature
   - Before making significant changes that might be hard to revert

### DON'T Commit and Push:

1. **Broken Code**:
   - Code that doesn't compile
   - Features that crash when used
   - Tests that fail

2. **Temporary Changes**:
   - Debug console logs
   - Commented out code blocks
   - "TODO" markers without associated functionality

3. **Sensitive Information**:
   - API keys
   - Passwords
   - JWT secrets
   - Patient data
   - Connection strings

4. **Generated Files**:
   - Build outputs
   - Log files
   - Dependency directories (node_modules)
   - Local environment files

## Best Practices for Ghana Healthcare Context

### Cultural and Regional Considerations:

1. **Ghana-Specific Features**:
   - Tag commits related to Ghana-specific features with `[Ghana]` prefix
   - Document cultural context in commit messages where relevant
   - Note any regional dialects or terms referenced in the code

2. **Medical Terminology**:
   - When adding Ghana-specific medical terms, include references to standard terminology
   - Document any local or traditional medical concepts in comments

3. **Regulatory Compliance**:
   - Note Ghana MOH (Ministry of Health) requirements where relevant
   - Tag commits related to compliance as `[Compliance]`
   - Include links to relevant guidelines when available

### Collaborative Development:

1. **Communication Before Commits**:
   - Discuss major changes with the team before implementation
   - Use GitHub Issues to track feature development
   - Reference issue numbers in commit messages and PRs

2. **Code Reviews**:
   - Request reviews from team members familiar with Ghanaian healthcare context
   - Be open to feedback, especially on cultural appropriateness
   - Ensure medical terminology and concepts are accurate

## Git Commands for Common Scenarios

### 1. Starting Work on a New Day:

```bash
# Update your local copy of the development branch
git checkout development
git pull origin development

# Create or checkout your feature branch
git checkout -b feature/your-feature   # If new feature
# OR
git checkout feature/your-feature      # If continuing work
git pull origin feature/your-feature   # If branch exists remotely

# Start coding...
```

### 2. Regular Commits During Development:

```bash
# Stage changes
git add file1.ts file2.ts   # Add specific files
# OR
git add .                   # Add all changed files (be careful!)

# Commit with meaningful message
git commit -m "[PatientManagement] Add NHIS validation"
```

### 3. Pushing to GitHub:

```bash
# Push to your feature branch
git push origin feature/your-feature
```

### 4. Before Creating a Pull Request:

```bash
# Update with latest development changes
git checkout development
git pull origin development
git checkout feature/your-feature
git merge development

# Resolve any conflicts
# Run tests
npm test

# Push final version
git push origin feature/your-feature

# Create PR on GitHub
```

## Example Workflow for GhEHR Features

### Example: Adding Ghana Medical NLP Improvements

1. **Initial Setup**:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/improve-ghana-nlp
   ```

2. **During Development (multiple commits)**:
   ```bash
   # After adding support for additional medical terms
   git add src/routes/clinicalNotes.ts
   git commit -m "[Ghana][NLP] Add support for Northern Ghana malaria terminology"
   
   # After improving confidence scoring algorithm
   git add src/utils/nlpAnalyzer.ts
   git commit -m "[NLP] Enhance confidence scoring algorithm for symptom patterns"
   
   # After adding tests
   git add tests/nlp-analyzer.test.ts
   git commit -m "[Test] Add tests for Ghana-specific medical term recognition"
   ```

3. **Daily Backup**:
   ```bash
   # At end of day, push changes even if feature isn't complete
   git push origin feature/improve-ghana-nlp
   ```

4. **Preparing for Review**:
   ```bash
   # Update with any team changes
   git checkout development
   git pull origin development
   git checkout feature/improve-ghana-nlp
   git merge development
   
   # Final testing
   npm test
   
   # Push final version
   git push origin feature/improve-ghana-nlp
   ```

5. **Create Pull Request on GitHub**:
   - Title: "Improve Ghana Medical NLP System"
   - Description: Detailed explanation of changes, testing done, etc.

Remember that clear communication in commit messages and pull requests is especially important in healthcare applications, where accuracy and context can have significant implications for patient care.
