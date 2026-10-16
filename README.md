# R&D Resource Management Portal
**Research and Development Cell (R&D Cell), Parul University**

A full-stack, responsive web application built for the **Research and Development Cell (R&D Cell) of Parul University**. This system coordinates university research resources, equipment bookings, sample testing workflows, formal quotations, role-based staff operations, resource utilization analytics, and audit logs.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/nipun-25/RnD-Recource-Booking.git
cd "RnD Recource Booking"

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Lint Checks
```bash
# Verify TypeScript and build all static & dynamic routes
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```

---

## 2. Safe Local Test Procedures & Demo Accounts

The portal features an **Evaluation & Role Switcher Bar** at the top of every screen for quick, non-disruptive testing across all operational roles. You can also sign in via `/login` using the following demonstration credentials:

| Role | Username | Password (Demo) | Simulated User | Scope & Permissions |
|---|---|---|---|---|
| **Public Requester** | *(Unauthenticated)* | N/A | University Scholar / External Researcher | Browse catalog, book slots, submit samples, track tracking ID |
| **Administrator** | `admin` | `password123` | Dr. Anand Joshi | Master oversight: equipment CRUD, staff provisioning, status overrides, audit logs, analytics |
| **Reception & Logistics** | `reception` | `password123` | Kinjal Patel | Triage queue, assign specialists, dispatch quotations, log sample receipts, dispatch reports |
| **Equipment Owner (1)** | `dr.sharma` | `password123` | Dr. Rajesh Sharma | Assigned instruments: technical feasibility, start run, record actual hours, log maintenance |
| **Equipment Owner (2)** | `dr.desai` | `password123` | Dr. Vandana Desai | Assigned instruments: technical feasibility, run tracking, maintenance log |

> **Security Note:** The top evaluation bar and client-side role switcher are strictly for local evaluation and testing. Production deployments will enforce server-side session authentication with hashed credentials.

---

## 3. Architecture & Data Access Layer (DAL)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router (16+)                        │
├───────────────────────────────────┬────────────────────────────────────┤
│           Public Portal           │            Staff Portals           │
│  /  /catalog  /book  /track       │   /admin  /reception  /owner       │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Workflow State Machine Engine              │
       │         (canActorTransition, Safe Public Labels)       │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             Data Access Layer (IDataStore)             │
       │  src/lib/data-adapter.ts (Clean Repository Interface)  │
       └───────────┬────────────────────────────────┬───────────┘
                   │                                │
                   ▼ (Active Now)                   ▼ (Phase 8 Target)
      ┌────────────────────────┐      ┌───────────────────────────────┐
      │  DemoDataStore Adapter │      │  Google Sheets Server Adapter │
      │  (In-Memory / Local)   │      │  (Secure Apps Script / API)   │
      └────────────────────────┘      └───────────────────────────────┘
```

### Google Sheets Persistence Strategy
- **Sole Persistent Database:** The architecture routes all data persistence through `IDataStore` in [src/lib/data-adapter.ts](file:///d:/GitHub/RnD%20Recource%20Booking/src/lib/data-adapter.ts). No MongoDB, PostgreSQL, SQLite, or Firebase is used.
- **Target Spreadsheet Schema Tabs:**
  - `Equipment` (Specs, capacity, owner IDs, rate)
  - `Staff` (User metadata, role, status; no plaintext secrets)
  - `Requests` (Tracking ID with `RND` prefix, requester profile, project scope)
  - `Quotations` (Billing breakdown and acceptance)
  - `Samples` (Hazards, storage conditions, return request)
  - `Usage_Sessions` (Scheduled vs actual operating hours)
  - `Maintenance` (Downtime logs and resolution)
  - `Audit_Logs` (Immutable timestamped ledger)
- **Zero Secret Exposure:** Google service account keys and API tokens will be restricted exclusively to server-side API routes.

---

## 4. Key Functional Areas

1. **Public Web Portal:**
   - **Resource Catalog (`/catalog`):** Browse university equipment and specialized testing tools with category and availability filters.
   - **Booking Request (`/book`):** Intake with auto-assigned non-sequential tracking ID (`RND-2026-XXXX`).
   - **Sample Submission (`/submit-sample`):** Detailed hazard declarations, storage parameters, and sample return preferences.
   - **Public Tracking (`/track`):** Safe, sanitized milestone progress timeline. Internal staff deliberations and financial discussions are strictly withheld.
   - **About & Contact (`/about`, `/contact`):** R&D Cell guidelines, desk hours, and university location.

2. **Administrator Portal (`/admin`):**
   - Resource dashboard (active equipment, pending approvals, utilization rate).
   - Equipment Management (add, edit, specifications, owner assignments, archive).
   - Staff Administration (provision reception/owners, secure password reset invitations, deactivate).
   - Master Request Registry (search, filter, administrative status override).
   - Analytics & Audit Logs (Recharts utilization graphs, CSV downloads).

3. **Reception Desk (`/reception`):**
   - Central intake queue with tab filters (New, With Specialist, Quotations, Samples, Ready).
   - Specialist assignment modal.
   - Quotation calculation and dispatch.
   - Physical sample custody logging.
   - Handover and report dispatch closure.

4. **Equipment Owner Workstation (`/owner`):**
   - Strictly restricted to authorized instruments and assigned requests.
   - Technical feasibility assessment (Accept, Need Clarification, Reject with reason).
   - Active session execution (Start Run, Log Actual Operating Hours).
   - Tool downtime and maintenance logging.

---

## 5. Technology Stack

- **Framework:** Next.js (App Router, Turbopack, React 19)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Data Access:** Repository Pattern DAL (`IDataStore`)

---

## 6. Vercel Demo Deployment Guide

This project is fully configured and ready for single-click demonstration deployment to [Vercel](https://vercel.com):

### Deployment Configuration
1. **Repository Import:** In your Vercel Dashboard, click **Add New...** > **Project**, and select the `RnD-Recource-Booking` repository.
2. **Framework Preset:** Vercel automatically detects `Next.js`.
3. **Build Command:** `npm run build` (or leave default).
4. **Output Directory:** `.next` (leave default).
5. **Install Command:** `npm install` (leave default).
6. **Node.js Version:** Set to `20.x` or `22.x` under Project Settings > General.
7. **Environment Variables:** **None required** for demo deployment mode. All demonstration records, state machines, and workflows run securely out-of-the-box.

### Demonstration Architecture & Security Boundaries
- **Browser-Local Isolation:** All interactions (equipment editing, booking requests, sample tracking updates) persist in the evaluator's browser (`localStorage`). State mutations do not overwrite the base application or leak to other evaluators.
- **Evaluation Role Switcher:** The top evaluation bar and staff sign-in form are provided exclusively for testing multi-role workflows. Real institutional SSO and server-side authorization will be introduced in production.
- **Zero Exposed Secrets:** No database credentials, Google Cloud keys, or sensitive university records are included in the repository or bundle.

