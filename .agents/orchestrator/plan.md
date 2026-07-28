# Orchestration Plan: Emerald Summit App - Mentor & Parent Pages

## Objective
Orchestrate the development and automated testing of Mentor Dashboard (R1) and Parent Spectator View (R2) adhering strictly to Emerald Mist Design System (R3) and unit/component testing standards (R4).

## Decomposition & Workflow

### Phase 1: Exploration & Architecture Analysis (M1)
- Dispatch 3 Explorer subagents to inspect:
  1. Routing structure (Next.js/React Router/etc.), AppShell, PageHeader, layout components, navigation menus.
  2. Design system: Tailwind config, shadcn/ui components, `.glass` styles, Fraunces font usage, global CSS rules.
  3. Test infrastructure: test runner (Jest, Vitest, Playwright, React Testing Library), scripts, existing test patterns, mock data structures.

### Phase 2: Parallel Dual Track Execution
- **E2E / Component Testing Track (M2)**:
  - Create test cases & infrastructure for Mentor Dashboard and Parent Spectator View.
  - Define Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner Cases), Tier 3 (Cross-feature / Read-only constraints), Tier 4 (Real-world scenarios).
  - Publish `TEST_READY.md`.

- **Implementation Track (M3 & M4)**:
  - **M3: Mentor Dashboard**:
    - Implement page adhering to `AppShell`, `PageHeader`, `.glass` cards, Fraunces font.
    - Display assigned track, participant roster, check-in management controls.
    - Run unit/component tests.
  - **M4: Parent Spectator View**:
    - Implement spectator page adhering to `AppShell`, `PageHeader`, `.glass` cards, Fraunces font.
    - Display mock linked student's schedule, activities, and progress.
    - Explicitly exclude registration or scheduling modification actions (read-only).
    - Run unit/component tests.

### Phase 3: Final Verification & Audit (M5)
- Reviewer verification & Challenger verification of both pages.
- Forensic Auditor verification for zero cheating / genuine implementation.
- Confirm all acceptance criteria met.
