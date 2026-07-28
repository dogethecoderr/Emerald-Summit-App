# Original User Request

## Initial Request — 2026-07-27T20:07:18Z

Add Mentor and Parent specific pages to the Emerald Summit App. Mentors will have the same privileges as student ambassadors leading a track, and Parents will have a spectator view of their student's schedule and progress.

Working directory: c:/Users/arush/Downloads/Emerald-Summit-App-main
Integrity mode: development

## Requirements

### R1. Mentor Dashboard
Build a dashboard page for Mentors (who are effectively student ambassadors leading a specific track). The page should display the track they are leading and provide UI to manage it (e.g., view participants, check-ins). 

### R2. Parent Spectator View
Build a spectator page for Parents. This page should provide a read-only view of a linked student's schedule, activities, and progress. It must not contain actions to register or build a schedule on the student's behalf.

### R3. Design System Adherence
The new pages must perfectly match the existing "Emerald Mist" design system. You must use the existing Tailwind configuration, shadcn/ui components, `.glass` utilities for cards, and the `Fraunces` font for display headings. Stick to the `AppShell` and `PageHeader` layout structures. Do NOT modify the core global styles.

### R4. Automated Testing
Write programmatic tests (e.g., unit tests or component tests depending on the project's setup) to verify the UI structure and behavior of the new Mentor and Parent pages.

## Acceptance Criteria

### Mentor Dashboard
- [ ] A dedicated page for Mentors is accessible.
- [ ] Displays the mentor's assigned track and relevant management tools.
- [ ] Automated tests verify the rendering and core logic of the Mentor dashboard.

### Parent Spectator View
- [ ] A dedicated page for Parents is accessible.
- [ ] Displays a read-only schedule/progress for a mock linked student.
- [ ] UI explicitly lacks any scheduling or registration modification actions.
- [ ] Automated tests verify the rendering and read-only nature of the Parent page.

### Design System
- [ ] Pages use existing layout components (`AppShell`, `PageHeader`).
- [ ] Pages use the `.glass` utility for cards and panels.
- [ ] The user can manually verify the pages and confirm they match the "Emerald Mist" aesthetic.
