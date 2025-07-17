# GhEHR Pre-Deployment Verification Checklist

This document outlines the step-by-step process to verify that the GhEHR system is working correctly in the local environment before deploying to production.

## 1. Environment Setup Verification

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Backend health check endpoint responding (`http://localhost:5000/health`)
- [ ] Environment variables properly configured
  - Backend: `.env` file with JWT_SECRET, PORT, etc.
  - Frontend: `.env` file with REACT_APP_API_URL

## 2. Authentication Verification

- [ ] Login with test credentials (username: `admin@ghehr.org`, password: `admin123`)
- [ ] JWT token generated and stored correctly (check Local Storage)
- [ ] Protected routes working (try accessing dashboard directly)
- [ ] Logout functionality working

## 3. Patient Management Verification

- [ ] Patient list loads correctly
- [ ] Patient search functionality works
- [ ] Patient filtering works
- [ ] Create new patient with all fields
- [ ] Create new patient with only required fields
- [ ] Edit existing patient
- [ ] Patient demographics display correctly
- [ ] NHIS insurance information displays correctly (both with and without insurance)

## 4. Clinical Notes Verification

- [ ] Select patient and view clinical notes
- [ ] Create new clinical note
- [ ] Test Ghana Medical NLP with at least 5 different test cases from `MEDICAL_NLP_TEST_CASES.md`
- [ ] Verify symptom extraction is accurate
- [ ] Verify condition suggestions are appropriate
- [ ] Verify confidence scores make sense
- [ ] Verify treatment recommendations are relevant
- [ ] Save clinical note and verify persistence
- [ ] Edit existing clinical note

## 5. Appointment Management Verification

- [ ] Appointment list loads correctly
- [ ] Create new appointment
- [ ] Filter appointments by date, provider, etc.
- [ ] Update appointment status
- [ ] Cancel appointment
- [ ] Verify calendar view works

## 6. Billing Verification

- [ ] Create new invoice for patient
- [ ] Add line items to invoice
- [ ] Verify total calculations are correct
- [ ] Mark invoice as paid
- [ ] Generate/view receipt

## 7. Cross-Browser Testing

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge (if available)

## 8. Mobile Responsiveness

- [ ] Test on desktop (regular window)
- [ ] Test on tablet size (resize browser window)
- [ ] Test on mobile size (resize browser window)

## 9. Error Handling

- [ ] Test with invalid inputs
- [ ] Verify appropriate error messages
- [ ] Test recovery from error states

## 10. Performance

- [ ] Pages load within reasonable time
- [ ] No noticeable UI lag when interacting with components
- [ ] Debouncing works correctly for real-time analysis

## 11. Build Verification

- [ ] Create production build of frontend:
  ```bash
  cd frontend
  npm run build
  ```
- [ ] Verify build artifacts in the `build` directory
- [ ] Serve the build locally to test:
  ```bash
  npx serve -s build
  ```
- [ ] Verify the built application functions correctly

## 12. Deployment Package Creation

- [ ] Copy frontend build to backend public directory
- [ ] Create deployment ZIP file
- [ ] Verify deployment package includes all necessary files

## Encountered Issues

| Issue | Description | Status | Fix Applied |
|-------|-------------|--------|------------|
|       |             |        |            |

## Pre-Deployment Sign-Off

- [ ] All critical functionality verified
- [ ] All previously identified bugs fixed
- [ ] No new bugs introduced
- [ ] Performance acceptable
- [ ] Security measures in place

**Verified By**: _________________________

**Date**: _________________________

**Notes**: _________________________

**Decision**: ☐ Proceed with Deployment  ☐ Needs Further Work
