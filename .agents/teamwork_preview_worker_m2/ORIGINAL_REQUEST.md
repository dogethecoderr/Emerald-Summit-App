## 2026-07-27T13:08:58Z
You are Worker M2 (Test Infrastructure & Test Suite Setup).
Working directory: c:\Users\arush\Downloads\Emerald-Summit-App-main\.agents\teamwork_preview_worker_m2
Target project: c:\Users\arush\Downloads\Emerald-Summit-App-main
Parent project doc: c:\Users\arush\Downloads\Emerald-Summit-App-main\.agents\orchestrator\PROJECT.md

Your objective:
1. Setup testing infrastructure for the project:
   - Add devDependencies to `package.json`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
   - Add script `"test": "vitest run"` to `package.json`.
   - Configure `vitest.config.ts` or add `test` config to `vite.config.ts` with `environment: 'jsdom'`, `globals: true`, setup file `./src/test/setup.ts`, and alias `@/*` pointing to `./src/*`.
   - Create `./src/test/setup.ts` with `@testing-library/jest-dom`.
2. Write comprehensive unit/component test suites for Mentor Dashboard and Parent Spectator View in `src/pages/__tests__/MentorDashboard.test.tsx` and `src/pages/__tests__/ParentSpectatorView.test.tsx`:
   - Tier 1 (Feature Coverage): Verify rendering of Mentor page (assigned track displayed, participant list, check-in tools/status) and Parent spectator page (mock linked student schedule, activities, progress).
   - Tier 2 (Boundary & Corner Cases): Verify behavior with empty schedules or unassigned tracks.
   - Tier 3 (Cross-Feature & Read-only Security): Verify Parent spectator view explicitly lacks any registration or schedule building/modification actions. Verify role gating.
   - Tier 4 (Design System Adherence): Verify pages use `AppShell`, `PageHeader`, `.glass` cards, and display headings.
3. Run the test suite via `npm run test` (or `npx vitest run`) and `npm run build` (`tsc && vite build`) to verify all tests pass and build succeeds.
4. Publish `c:\Users\arush\Downloads\Emerald-Summit-App-main\TEST_READY.md` summarizing the test infrastructure, runner command (`npm run test`), test suite counts, and tier breakdown.
5. Create handoff report in `c:\Users\arush\Downloads\Emerald-Summit-App-main\.agents\teamwork_preview_worker_m2\handoff.md` and update `progress.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
