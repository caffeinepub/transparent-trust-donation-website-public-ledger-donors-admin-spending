# Specification

## Summary
**Goal:** Build a public-facing transparent trust donation website with a persistent ledger of donations and spending, plus admin-restricted spending entry, and clear public reporting.

**Planned changes:**
- Implement a persistent Motoko backend ledger storing donor profiles, incoming donations, outgoing spending records, and a computed trust balance (in minus out) that survives upgrades.
- Add Internet Identity–based admin allowlisting in canister state, with a safe initial admin setup flow; enforce authorization for creating/managing spending (and donor management where applicable).
- Create public UI pages for a Transparency Dashboard (current balance, totals in/out, recent transactions, spending breakdown by category/purpose).
- Create a public Transaction Ledger UI with filtering (incoming/outgoing/category), sorting (newest/oldest), and transaction detail views.
- Create a public Donor/Member listing UI with donor totals and a donor detail view showing contribution history, with safe handling for anonymous donors and omission of sensitive fields.
- Add a Donation flow to submit donation records (amount + optional note), supporting both signed-in (linked to principal) and anonymous contributions, with validation against invalid/negative amounts.
- Add an admin-only UI for creating outgoing spending records (category/purpose, amount, description, date/time, optional reference text), blocking entries that would make the balance negative.
- Ensure transparency pages are accessible without login and add a coherent, distinctive visual theme across the site.
- Include generated static assets (logo + hero illustration) under `frontend/public/assets/generated` and reference them from the UI.

**User-visible outcome:** Anyone can view the trust’s current balance, full public ledger, spending breakdowns, and donor contribution listings without signing in; supporters can submit donations (anonymous or signed-in), and allowlisted admins can record spending that updates the public ledger.
