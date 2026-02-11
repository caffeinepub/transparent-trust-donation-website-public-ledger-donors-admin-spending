# Specification

## Summary
**Goal:** Protect donor phone-number privacy for non-admin users and ensure the UI only uses the single uploaded donations photo with the “Why Not Us” logo.

**Planned changes:**
- Update backend donor-profile read APIs to return masked phone numbers for non-admin callers, while returning full phone numbers for admins.
- Update frontend donor list/detail views to display masked phone numbers for non-admin viewers and full numbers only for admins.
- Replace/remove any usage of generated/placeholder images so the UI uses only the uploaded donations photo asset wherever an image is rendered (including replacing the current dashboard hero image).

**User-visible outcome:** Non-admin users only ever see masked donor phone numbers, admins can see full numbers, and the site’s visuals use only the uploaded donations photo (no other images).
