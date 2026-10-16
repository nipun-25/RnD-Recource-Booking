# R&D Resource Management Portal — Project Status & Verification Report
**Research and Development Cell (R&D Cell), Parul University**

- **Milestone:** Milestone 2 (Verification, Testing & System Hardening)
- **Status:** Complete & Verified (`npm run build` exits 0; all 19 routes prerendered)
- **Date:** October 2026
- **Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS, Recharts

---

## 1. Features Tested Successfully

Every public and staff route was systematically tested through end-to-end browser walkthroughs and automated static builds:

### Public Research Portal
- [x] **Institutional Homepage (`/`):** Hero section with Parul University R&D Cell branding, research infrastructure overview, featured equipment cards, 4-step workflow guide, and quick action links.
- [x] **Resource Catalog (`/catalog`):** Filter by category (Electron Microscopy, Spectroscopy, X-Ray, etc.), filter by operational status (Available, Maintenance), real-time search input with live result count.
- [x] **Resource Technical Details (`/catalog/[id]`):** Technical specs table, operating parameters, lab location, indicative demonstration rates, and direct "Book Usage Slot" / "Submit Sample" action buttons.
- [x] **Equipment Booking Form (`/book`):** Researcher name, email, department, institution category (Parul University Internal vs External), date picker, time slot, duration in hours, project title, and research objective. Generates a unique `RND-2026-XXXX` tracking confirmation.
- [x] **Sample Submission Intake Form (`/submit-sample`):** Sample name, material type, quantity, hazardous material declaration (biohazard/flammable/toxic/none), requested testing protocols, storage conditions, and sample return preference. Generates a unique `RND-2026-XXXX` tracking ID.
- [x] **Public Tracking Lookup (`/track`):** Look up requests by tracking ID with whitespace trimming and case-insensitive normalization. Displays sanitized progress timeline, current stage, expected turnaround, and public researcher notices.
- [x] **Privacy & Public-Internal Boundary:** Verified that internal staff notes, technical deliberation details, pricing calculations, and staff audit trails are **never exposed** on the public tracking interface.
- [x] **Institutional Pages (`/about`, `/contact`):** R&D Cell mission, general operating policies, indicative fee structure disclaimers, desk hours, and campus location.

### Staff & Role-Based Operational Portals
- [x] **Interactive Role Switcher:** Top evaluation bar allowing seamless switching between Public Researcher, Administrator, Reception Desk, and Equipment Owner for evaluation.
- [x] **Staff SSO Portal (`/login`):** Role-tailored login interface with one-click test credential population.
- [x] **Reception Desk Workflow (`/reception`):**
  - Live intake triage queue with count indicators.
  - Request assignment to designated equipment specialists.
  - Itemized quotation generation with indicative tier rates.
  - Physical sample custody intake confirmation with storage condition labels.
  - Dispatch and closure logging.
- [x] **Equipment Owner Specialist Portal (`/owner`):**
  - Strictly filtered to instruments assigned to the logged-in owner.
  - Technical feasibility review (Approve, Request Clarification, Reject).
  - Live session execution and actual operating hours logging.
  - Logging unscheduled maintenance downtime with specific fault reasons.
- [x] **Administrator Control Center (`/admin`):**
  - Six operational KPI cards (Active Tools, Total Requests, Pending Triage, Confirmed Slots, In Processing, Attention Items).
  - **Equipment Management (`/admin/equipment`):** Add new equipment, edit technical specifications and hourly rates, toggle operational status (Available, In Use, Maintenance), assign owner, and archive records.
  - **Staff Management (`/admin/staff`):** Provision staff accounts, assign primary instruments, toggle active/inactive status, and generate secure one-time password reset tokens.
  - **Master Request Registry (`/admin/requests`):** Comprehensive request history, multi-filter search, manual status override, and specialist reassignment.
  - **Analytics & Audit Ledger (`/admin/analytics`):** Utilization metrics, operating vs maintenance hours, monthly demand graphs, and immutable activity audit trail.

### Analytics Calculations & Export Verification
- [x] **Utilization Rate Formula:** Mathematically computed as `(actualHours / netAvailableHours) * 100`, where net available hours accounts for baseline operating capacity (160h/month) minus maintenance downtime.
- [x] **On-Time Performance:** Verified on-time start and completion rate calculations against session audit records.
- [x] **CSV Export Utilities:**
  - `rnd-equipment-utilization-YYYY-MM-DD.csv`: Successfully exports tool ID, name, actual hours, reserved hours, available hours, and utilization percentage.
  - `rnd-audit-trail-YYYY-MM-DD.csv`: Successfully exports timestamp, actor, role, action, target entity, and event details via browser Blob generation.

---

## 2. Features That Still Use Demo Data

The application architecture is complete and decoupled from UI components via `src/lib/data-adapter.ts`. The following areas currently utilize representative demonstration data:

| Feature / Domain | Current Demo State | Path to Production |
|---|---|---|
| **Equipment Inventory** | Representative instruments (FE-SEM, HR-XRD, Confocal Microscope, ICP-MS, Rheometer, etc.) | Replace with Parul University R&D Cell's official asset inventory once provided. |
| **Pricing & Fee Structure** | Indicative testing and hourly rates (labeled with explicit demonstration disclaimers) | Replace with approved institutional tariff schedule from university finance. |
| **Staff Accounts** | Pre-populated demo profiles (`dr.patel@rnd.paruluniversity.ac.in`, etc.) | Provision real faculty specialists and lab technicians via university user directory. |
| **Historical Requests & Sessions** | Seeded sample requests and past usage logs for analytics visualization | Clear demo records upon initial production deployment. |

---

## 3. Persistence Limitations

- **Browser-Local Persistence (`localStorage`):** The current implementation uses `DemoDataStore` backed by browser `localStorage` (keys: `rnd_portal_demo_*`).
- **Refresh & Tab Survival:** Changes created during runtime (new equipment, updated request statuses, maintenance entries, staff accounts) **persist cleanly across page reloads, tab navigation, and browser restarts** within the same browser.
- **Cross-Device & Cross-User Isolation:** Because data resides in browser storage, changes made on one browser/device do **not** synchronize to another computer or browser profile.
- **Cache Clearing:** Clearing browser cookies and site storage resets the portal back to initial demonstration seed data.
- **Target Backend Architecture:** In Phase 8, `IDataStore` will be implemented by `GoogleSheetsDataStore`, allowing all read and write operations to sync with Google Sheets without altering any UI components.

---

## 4. Security Limitations

- **Development Role Switcher:** The top evaluation bar is designed exclusively for local testing, rapid demonstration, and workflow inspection. **It does not provide genuine authentication, session encryption, or authorization.**
- **Client-Side Authorization Checks:** Workflow state transitions (`canActorTransition()`) and route guards currently run in the client application. In a production environment, all mutating actions must be authorized server-side using secure session tokens.
- **Sensitive Data Segregation:** While the public `/track` view strictly filters out internal notes, financial deliberations, and staff details from the researcher's view, all data in the demo adapter resides in client memory. Production must use server-side data projection to omit restricted fields before network transmission.
- **Audit Log Tamper-Resistance:** Audit log entries are currently recorded in the local store. Production requires an append-only, server-controlled audit sink.

---

## 5. Bugs & Technical Defects Fixed

1. **Branding & Identity Harmonization:**
   - Eradicated all references to legacy "Micro-Nano R&D Center", cleanroom bays, and the `MNRND` prefix across all files, components, and metadata.
   - Updated all branding to **Research and Development Cell (R&D Cell), Parul University**.
   - Standardized tracking ID generation to `RND-2026-XXXX`.
2. **Next.js 16 / Turbopack Prerendering Boundaries:**
   - Resolved prerender build failures caused by `useSearchParams()` and `usePathname()` in client components during static generation.
   - Encapsulated `Navbar`, `AdminNavTabs`, and dynamic search filter consumers within React `<Suspense>` boundaries.
3. **React 19 / ESLint 9 Date Purity:**
   - Fixed dynamic evaluation of `new Date()` within render templates that violated React 19 component purity rules. Replaced with static constants and event-driven timestamps.
4. **Tracking Lookup Resilience:**
   - Implemented case-insensitivity and automatic whitespace trimming in `/track` to prevent lookup misses for valid tracking numbers.
5. **Linting & Code Cleanliness:**
   - Cleaned up unused variables and enforced `const` declarations across `src/lib/analytics.ts` and portal views.
6. **React 19 / Next.js 16.4.2 Navbar Hydration Contract Resolution:**
   - Resolved the hydration mismatch where `Navbar` rendered `INITIALIZING...` on the server while the client rendered `PUBLIC (Guest / Public)` due to asynchronous Suspense boundary resolution and parent provider effect ordering.
   - Implemented a component-local mounted state latch (`isReady = mounted && isHydrated`) ensuring identical placeholder rendering on initial SSR and client hydration pass before activating restored demo sessions.
   - Validated cleanly with 0 hydration errors across guest and all staff roles (Owner, Reception, Admin) with full page reloads.

---

## 6. Remaining Work Before Real Users Can Use the System

Before opening the portal to university researchers and staff, the following tasks must be completed:

1. **Google Sheets Persistent Adapter (Phase 8):**
   - Configure a Google Cloud Service Account with Google Sheets API credentials (or Google Apps Script webhook).
   - Implement `GoogleSheetsDataStore` implementing the `IDataStore` interface.
   - Provision Google Sheet tabs: `Equipment`, `Staff`, `Requests`, `Quotations`, `Samples`, `Usage_Sessions`, `Maintenance`, `Audit_Logs`.
2. **Official Resource Inventory Ingestion:**
   - Ingest approved equipment catalog from Parul University R&D Cell (instrument names, models, lab locations, technical capabilities, sample preparation requirements).
   - Upload verified equipment photographs and operating manuals.
3. **Production Authentication & Authorization:**
   - Replace the local evaluation role switcher with Parul University Single Sign-On (SSO), LDAP, or Google Workspace OAuth.
   - Implement HTTP-only, secure, signed session cookies.
   - Enforce server-side role and permission validation on all mutations via Next.js Server Actions or API routes.
4. **Automated Researcher Notification Pipeline:**
   - Implement email/SMS notifications for milestone updates (Quotation Ready, Sample Received, Testing In Progress, Report Ready).
5. **Institutional Deployment:**
   - Configure university subdomain (e.g., `rnd.paruluniversity.ac.in`).
   - Enable SSL/TLS termination, rate limiting, and automated backups of the persistent storage sheet.

---

## 7. Pre-Deployment Audit for Vercel (Demo Mode)

### A. Test Execution & Verified Results
| Test Category | Command / Harness | Actual Result | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npx tsc --noEmit` | Clean exit (code 0), 0 type errors | **PASS** |
| **ESLint Static Analysis** | `npm run lint` | 0 errors, 76 harmless unused-icon warnings | **PASS** |
| **Clean Next.js Build** | `rmdir /s /q .next && npm run build` | Compiled successfully in 9.3s; all 19 routes prerendered (code 0) | **PASS** |
| **Browser Hydration (Edge CDP)** | Automated WebSocket CDP test suite | 5 role reload cycles tested; 0 hydration mismatches, 0 exceptions | **PASS** |
| **Asset & Image Integrity** | Static scan of `src/` | 100% SVG/Lucide icons; zero remote image domains or broken CDN dependencies | **PASS** |

### B. Files Changed in Audit & Reasons
- `src/components/Navbar.tsx`: Added component-local `mounted` state latch (`isReady = mounted && isHydrated`) ensuring identical placeholder rendering on initial SSR and client hydration pass.
- `src/app/layout.tsx`: Re-added `<Suspense>` wrapper around `<Navbar />` to satisfy Next.js 16 dynamic prerendering requirements for `usePathname()`.
- `src/app/admin/layout.tsx`: Preserved child route segment rendering in a hidden container during unauthenticated/unhydrated states to satisfy Next.js instant navigation validation.
- `README.md`: Added Section 6 ("Vercel Demo Deployment Guide") detailing configuration, browser-local isolation, and zero environment variable requirements.
- `PROJECT_STATUS.md`: Added comprehensive Pre-Deployment Audit section and deployment recommendation.

### C. Security Review & Public Deployment Posture
- **Demo Role Switcher & Mock Auth:** The evaluation role switcher and click-to-fill demo credentials on `/login` are strictly client-side mechanisms.
- **Safe Evaluation Boundary:** Because `DemoDataStore` persists exclusively in the evaluator's browser (`localStorage`), any administrative actions taken by a public visitor affect **only their own local browser session**. They cannot alter the server, deface records for other visitors, or access private data.
- **Zero Secret Leakage:** Verified that no database credentials, Google Cloud private keys, or API tokens exist in the repository, git history, or client bundles.
- **No `NEXT_PUBLIC_*` Secrets:** Verified zero environment secrets are exposed in client-side code.

### D. Features Using Demo Data vs Storage
- **Static Mock Data:** Initial equipment inventory (FE-SEM, HR-XRD, etc.), demo staff profiles, sample requests, and baseline usage logs.
- **Browser Storage (`localStorage`):** User session state (`rnd_portal_auth_user`) and all mutations/new records (`rnd_portal_demo_*`).
- **Cross-User Sync:** None. Each evaluator gets an isolated browser experience; clearing local storage restores the default demo seed.

### E. Environment Variables
- **Demo Mode:** **None required.**
- *(Future Phase 8 Production Only):* `GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEET_ID`.

### F. Vercel Configuration Summary
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** `20.x` or `22.x`

### G. Unresolved Deployment Blockers
- **None.** The application builds cleanly, passes all hydration checks, and requires no external database or server configuration for demo deployment.

---

## 8. Deployment Recommendation

### **READY FOR DEMO DEPLOYMENT**

The application is thoroughly validated, builds with 0 errors, passes all hydration and runtime tests, and is safe for public demo deployment on Vercel under its documented client-side demonstration architecture.

