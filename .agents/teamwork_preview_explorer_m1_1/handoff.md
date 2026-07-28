# Handoff Report — Milestone 1: Codebase Exploration

## 1. Observation

### Codebase Architecture & Tech Stack
- **Framework & Libraries**: React 18.3.1 (`react`, `react-dom`), TypeScript 5.5.4, Vite 5.4.3, React Router DOM 6.26.2 (`react-router-dom`), Tailwind CSS 3.4.1, Radix UI primitives (`@radix-ui/react-*`), Lucide Icons (`lucide-react`), Framer Motion 11.18.2, Sonner 2.0.7 (`sonner`).
- **Entry Point**: `src/main.tsx` mounts `App` inside `StrictMode`, `BrowserRouter` (with future v7 flags), `AuthProvider`, `ScheduleProvider`, and `Toaster`.
- **Styling Theme**: "Emerald Mist" palette (`emerald`, `emerald-mint`, `emerald-glow`, `emerald-deep`), glassmorphism utility classes (`.glass`, `.glow-emerald`), display typography styled with `font-display` (Fraunces).

### Routing Structure (`src/App.tsx`)
Routes are registered in `src/App.tsx` (lines 16–31):
- `/` -> `<WelcomePage />` (`src/pages/WelcomePage.tsx`) — Public landing page.
- `/home` -> `<HomePage />` (`src/pages/HomePage.tsx`) — Displays `RolePicker` when unauthenticated, or role-customized dashboard when signed in.
- `/login/:role` -> `<LoginPage />` (`src/pages/LoginPage.tsx`) — Simulated OAuth sign-in (Google/LinkedIn) parameterized by role.
- `/profile` -> `<ProfileSetupPage />` (`src/pages/ProfileSetupPage.tsx`) — Onboarding profile setup form.
- `/schedule` -> `<SchedulePage />` (`src/pages/SchedulePage.tsx`) — Interactive schedule builder for participants (role-gated: `participant`).
- `/announcements` -> `<AnnouncementsPage />` (`src/pages/AnnouncementsPage.tsx`) — Live updates and attachment list.
- `/profiles` -> Redirects to `/settings`.
- `/settings` & `/settings/:section` -> `<SettingsPage />` (`src/pages/SettingsPage.tsx`) — Account hub & profile editor (`/settings/profile`).
- `/directory` -> `<DirectoryPage />` (`src/pages/DirectoryPage.tsx`) — Searchable directory of participants, mentors, experts, staff.
- `/resources` -> `<ResourcesPage />` (`src/pages/ResourcesPage.tsx`) — Filterable document and resource hub.
- `/judging` -> `<JudgingPage />` (`src/pages/JudgingPage.tsx`) — Judging schedule & interactive campus route map (role-gated: `expert`).
- `/student` -> `<StudentPage />` (`src/pages/StudentPage.tsx`) — Current mentor spectator lens page (role-gated: `mentor`).
- `*` -> Redirects to `/`.

### Layout & Navigation Components
- **`AppShell` (`src/components/AppShell.tsx`)**:
  - Provides fixed desktop sidebar (`aside.fixed.inset-y-0.left-0.w-60`) and mobile top/bottom navigation bars.
  - Contains `NAV_ITEMS` array (lines 31–45):
    - `Dashboard` (`/home`, `LayoutDashboard`) — All roles
    - `Schedule` (`/schedule`, `CalendarDays`) — `roles: ['participant']`
    - `Judging` (`/judging`, `Gavel`) — `roles: ['expert']`
    - `My Student` (`/student`, `BookUser`) — `roles: ['mentor']`
    - `Announcements` (`/announcements`, `Megaphone`) — All roles
    - `Directory` (`/directory`, `Users`) — All roles
    - `Resources` (`/resources`, `FolderOpen`) — All roles
    - `Settings` (`/settings`, `Settings`) — All roles
  - Helper function `navItemsForRole(roleName: string)` (line 47) filters items dynamically based on the active role.
- **`PageHeader` (`src/components/PageHeader.tsx`)**:
  - Standard top banner accepting `label`, `title`, optional `sub`, and optional `actions` node (lines 4–35).
- **Role Guard Hooks (`src/hooks/useRequireProfile.ts`)**:
  - `useRequireProfile()`: Validates active session and profile setup completion.
  - `useRequireRole(allowed: string[])`: Extends `useRequireProfile()` to restrict page access to specific user roles.

### Data Models & Mock Data (`src/models/` and `src/services/`)
1. **Roles (`src/models/roles.ts`)**:
   - `USER_ROLES`: Array of 6 roles — `participant`, `attendee`, `ambassador`, `admin`, `mentor`, `expert`.
   - `SIGN_IN_ROLES`: Filtered roles for sign-in selection (`participant`, `attendee`, `mentor`, `expert`).
   - *Note*: `parent` is currently not listed as a distinct role in `USER_ROLES`. In `src/services/auth.ts` (lines 267–272), legacy `'parent'` roles are auto-migrated to `'mentor'`.
2. **People (`src/models/people.ts`)**:
   - Interface `Person`: `id`, `name`, `role`, `org`, `email`, `phone`, `initials`, `bio`, `emailVisible`, `phoneVisible`, `bioVisible`, `status`.
   - `MOCK_PEOPLE`: Array of 11 demo profiles (e.g., `p7` Priya Sharma - participant, `p10` Ravi & Sunita Sharma - mentor, `p11` Teresa Mendes - mentor).
3. **Person Status (`src/models/personStatus.ts`)**:
   - `PersonStatus` type: `'none' | 'validated' | 'checkedIn'`. Helper: `personStatusLabel()`.
4. **Disciplines / Tracks (`src/models/disciplines.ts`)**:
   - `USER_DISCIPLINES`: 6 tracks — `techverse`, `biosphere`, `imaginex`, `novasphere`, `ventureverse`, `civicverse`. Helper: `disciplineByName()`.
5. **Sessions (`src/models/sessions.ts`)**:
   - Interface `Session`: `id`, `title`, `speaker`, `time`, `location`, `track`, `duration`, `description`, `capacity`, `enrolled`, `spectatorCap`, `spectators`, `room`.
   - `MOCK_SESSIONS`: 13 summit sessions (`s1` to `s13`). `TIME_SLOTS` and `WALKING_TIME` lookup matrix.
6. **Assignments (`src/models/assignments.ts`)**:
   - Interface `JudgingAssignment`: `id`, `sessionId`, `duty`, `note`. `MOCK_ASSIGNMENTS` array.
7. **Announcements (`src/models/announcements.ts`)**:
   - Interface `Announcement`: `id`, `title`, `body`, `category`, `date`, `pinned`, `author`, `audience`, `attachments`. `MOCK_ANNOUNCEMENTS` array.
8. **Resources (`src/models/resources.ts`)**:
   - Interface `Resource`: `id`, `title`, `description`, `category`, `type`, `size`, `discipline`, `updated`. `MOCK_RESOURCES` array.
9. **Auth & State Management**:
   - `AuthContext` (`src/context/AuthContext.tsx`): React context exposing `session`, `profile`, `loadingProfile`, `refreshProfile()`.
   - `ScheduleContext` (`src/context/ScheduleContext.tsx`): React context managing arrays `mySchedule` and `spectating`.
   - `auth.ts` (`src/services/auth.ts`): LocalStorage mock backing `mock_session`, `mock_profiles`, `pending_user_role`.

---

## 2. Logic Chain

1. **Routing & Navigation Integration**:
   - All app pages are top-level components rendered inside `AppShell` (except full-screen views like `WelcomePage`, `LoginPage`, `ProfileSetupPage`).
   - Sidebar links are driven by `NAV_ITEMS` in `AppShell.tsx`. Page routes must be registered in `App.tsx`.
   - Role-based routing is guarded by `useRequireRole([...])` inside each page component.

2. **Integration Plan for Mentor Dashboard (R1 - Milestone 3)**:
   - *Current State*: `StudentPage.tsx` at `/student` acts as a basic mentor view for a single student (Priya Sharma).
   - *Target Requirements*: Mentor Dashboard (R1) requires full track & participant management UI.
   - *Logic*:
     - Route: Retain or enhance `/student` or add route `/mentor` in `App.tsx`.
     - Page Component: Replace or expand `StudentPage.tsx` with a rich `MentorDashboardPage.tsx` (or refactored `StudentPage.tsx`).
     - Features: Student switcher/selector (to select between linked students in `MOCK_PEOPLE`), track & session progress view, participant check-in status indicators (`PersonStatus`), and mentor action controls.
     - Navigation: `AppShell.tsx` already has `{ to: '/student', label: 'My Student', icon: BookUser, roles: ['mentor'] }`. Update label to "Mentor Dashboard" or keep "My Student", mapping role `mentor`.

3. **Integration Plan for Parent Spectator View (R2 - Milestone 4)**:
   - *Current State*: No dedicated Parent role or Parent spectator view exists. `auth.ts` currently migrates legacy `'parent'` role to `'mentor'`.
   - *Target Requirements*: Parent Spectator View (R2) requires read-only schedule and student progress tracking for parents.
   - *Logic*:
     - Role Definition: In `src/models/roles.ts`, add a `parent` role to `USER_ROLES` and `SIGN_IN_ROLES` (label: "Parent", description: "Spectate student schedule, track progress, and view summit events", icon: `Eye` or `Users`, color: `#D97706`).
     - Auth Service: In `src/services/auth.ts`, update `getCurrentProfile` to preserve `'parent'` role instead of converting to `'mentor'`.
     - Route: Add route `/parent` (or `/spectator`) in `src/App.tsx` mapped to `<ParentPage />` (`src/pages/ParentPage.tsx`).
     - Layout Nav: In `src/components/AppShell.tsx`, add nav item: `{ to: '/parent', label: 'Parent Spectator', icon: Eye, roles: ['parent'] }`.
     - Quick Actions: In `src/pages/HomePage.tsx`, add quick action entry for `parent` role pointing to `/parent`.
     - Component Implementation: Create `src/pages/ParentPage.tsx` using `AppShell`, `PageHeader`, `useRequireRole(['parent'])`, rendering a read-only student schedule, live event status, campus map link, and spectator session list.

---

## 3. Caveats

- **Mock Data Scope**: All auth, people, session, and schedule data are local mock objects in localStorage or TypeScript constants. No backend API or Supabase DB calls are currently active.
- **Single Linked Student Mock**: `StudentPage.tsx` currently hardcodes `LINKED_STUDENT` to Priya Sharma (`p7`). Real multi-student linking or parent-student binding data structures will need mock data extensions in `src/models/people.ts` or a dedicated context.
- **Parent Role Migration**: `src/services/auth.ts` line 268 explicitly converts `profile.role === 'parent'` to `'mentor'`. When introducing R2, this migration rule must be removed or modified to allow the `parent` role.

---

## 4. Conclusion

- The codebase is clean, well-structured, and ready for Milestone 3 (Mentor Dashboard R1) and Milestone 4 (Parent Spectator View R2).
- The routing pattern (`App.tsx`), layout standard (`AppShell` + `PageHeader`), role gating (`useRequireRole`), and model structure (`src/models/*`) provide clear, consistent extension points.
- **Recommended File Additions & Modifications for Subsequent Milestones**:
  - `src/models/roles.ts`: Add `parent` role definition to `USER_ROLES` and `SIGN_IN_ROLES`.
  - `src/services/auth.ts`: Update role handling to retain `parent` role; update `HomePage.tsx` `QUICK_ACTIONS`.
  - `src/App.tsx`: Add route `/parent` mapped to `ParentPage.tsx`.
  - `src/components/AppShell.tsx`: Update `NAV_ITEMS` to include Parent spectator view and refine Mentor dashboard link.
  - `src/pages/StudentPage.tsx` / `src/pages/MentorPage.tsx`: Expand R1 Mentor Dashboard UI with track & participant management.
  - `src/pages/ParentPage.tsx`: Implement R2 Parent Spectator View UI with read-only schedule/progress tracking.

---

## 5. Verification Method

To verify these observations independently:
1. Inspect routes in `src/App.tsx` and navigation items in `src/components/AppShell.tsx`.
2. Run build verification: `npm run build` (executes `tsc && vite build`).
3. Check role behavior by selecting different roles on `/home` (unauthenticated RolePicker) or navigating to `/login/:role`.
