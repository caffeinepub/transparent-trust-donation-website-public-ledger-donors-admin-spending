# Specification

## Summary
**Goal:** Expand the post-login profile setup modal to collect and persist name, age, optional email, phone number, and gender, with all UI/validation messages in English.

**Planned changes:**
- Update `frontend/src/components/auth/ProfileSetupModal.tsx` to add required inputs for Name, Age, Phone (+91 India validation), and Gender (fixed controlled options), plus optional Email, with English validation/errors.
- Ensure successful submission uses the existing `useSaveCallerUserProfile` mutation and shows a success toast in English; block submission when required fields are missing/invalid.
- Extend the backend `UserProfile` type and related endpoints (`getCallerUserProfile`, `getUserProfile`, `saveCallerUserProfile`) to store/return the new fields (age, gender) while keeping email optional and supporting required phone capture.
- Add backend upgrade/migration logic so existing stored profiles remain loadable and new fields get safe default/null-equivalent values after canister upgrades.
- Update frontend types/usages so `frontend/src/components/donate/DonationForm.tsx` continues to prefill donor name/email/phone from the saved profile and TypeScript builds cleanly.

**User-visible outcome:** After logging in, users without a saved profile will be prompted to complete a profile form (name, age, phone, gender, optional email). Once saved, their details persist and donation fields continue to prefill correctly.
