# Project: Emerald Summit App - Mentor & Parent Pages

## Architecture
- Framework: React 18.3, TypeScript 5.5, Vite 5.4, React Router DOM 6.26.
- Layout Architecture: `AppShell` container (`src/components/AppShell.tsx`), `PageHeader` display banner (`src/components/PageHeader.tsx`), `.glass` utility cards.
- Theme/Typography: "Emerald Mist" theme (HSL tokens in `src/index.css`), display headings in `Fraunces` (`font-display`), body in `Instrument Sans` (`font-sans`).
- State & Auth: `AuthContext` (`src/context/AuthContext.tsx`), `ScheduleContext` (`src/context/ScheduleContext.tsx`), Mock localStorage auth (`src/services/auth.ts`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Codebase Exploration | Map routes, layout components, design system, test setup | none | DONE |
| 2 | Testing Suite Setup | Install Vitest + RTL + jsdom, configure test scripts & specs, publish `TEST_READY.md` | M1 | DONE |
| 3 | Mentor Dashboard (R1) | Build Mentor page with track & participant management UI, write unit/component tests | M1, M2 | DONE |
| 4 | Parent Spectator View (R2) | Build Parent spectator page with read-only schedule/progress, write unit/component tests | M1, M2 | DONE |
| 5 | Review & Forensic Audit | Verification by Reviewers, Challengers, and Forensic Auditor | M3, M4 | DONE |

## Code Layout
- Routing: `src/App.tsx` (`/mentor`, `/parent`)
- Layout Components: `src/components/AppShell.tsx`, `src/components/PageHeader.tsx`
- Domain UI Components: `src/components/TrackPill.tsx`, `src/components/PersonCard.tsx`, `src/components/CapacityBar.tsx`
- Primitive UI Components: `src/components/ui/*` (21 shadcn/ui components)
- Pages:
  - Mentor Dashboard (R1): `src/pages/MentorDashboard.tsx`
  - Parent Spectator View (R2): `src/pages/ParentSpectatorView.tsx`
- Models & Services: `src/models/roles.ts`, `src/services/auth.ts`
- Tests: `src/pages/__tests__/MentorDashboard.test.tsx`, `src/pages/__tests__/ParentSpectatorView.test.tsx`
