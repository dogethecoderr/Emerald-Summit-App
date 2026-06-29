# Emerald Summit App 🐉

A single companion mobile app for the Tri-Valley's largest student-run STEAM summit — turning a day of 20+ tracks, 30+ experts, and hundreds of participants into one calm, self-directed experience.

| | |
|---|---|
| **Event** | Emerald Summit '27 |
| **When** | January 2027 |
| **Where** | Emerald High, Dublin CA |
| **Platform** | iOS + Android (Flutter) |
| **Owner** | EHS Academic Foundation · EAF Tech Team |

---

## Overview

The Emerald Summit runs corporate-style and is driven entirely by students. With six disciplines, 20+ tracks, and 30+ visiting experts spread across a high-school campus, the hardest problem on the day is orientation: knowing where to be, who is judging you, what changed, and where everyone is.

Today that lives across Instagram, email, paper, sheets, forms, and word of mouth. This app pulls all of it into one place backed by a live database, so a participant's plan, an ambassador's contact card, an expert's bio, and an admin's last-minute announcement are always the same source of truth.

### What success looks like

- **Clean registration on the day** — an EAF parent volunteer checks in participants in the app for clean attendance
- **Nobody asks "where do I go next?"** — the app tells them before they need to ask; their schedule was already built beforehand
- **Admins broadcast once** and reach every phone and inbox instantly
- **Certificates of Volunteer Hours** delivered as downloadable PDFs within minutes, not weeks

---

## Roles & permissions

Users sign in and select a role on launch. The role is stored on their record and enforced with row-level security.

| Capability | Participant | Ambassador | Expert | Admin |
|---|:---:|:---:|:---:|:---:|
| Build schedule & register | ● | ● | — | ● |
| Receive next-up notifications | ● | ● | ● | ● |
| Publish a contact profile | ● | ● | ● | ● |
| Edit activity marketing page | — | ● | — | ● |
| Log volunteer hours | ● | ● | — | ● |
| Post announcements* | — | ● | — | ● |
| Check-in & people management | — | — | — | ● |

\* Ambassadors can post announcements to select groups (e.g. all ambassadors).

**Parent role** — A parent links to their student (confirmed by the student or an admin) and follows that student's day through a spectator lens. They receive notifications tied to their student's activities and general headlines, but cannot schedule or register on the student's behalf.

---

## Features

### Build your own schedule *(Participant)*
A browsable catalog of all six disciplines and their tracks. Participants tap into any session to read its marketing page, then add it to a personal day plan. The builder enforces real constraints — no overlapping time blocks, warnings when a track is full, and walking time between back-to-back rooms. Session capacity limits apply.

### Announcements *(Admin → everyone)*
Admins compose an announcement once; it lands as a push notification, an in-app feed item, and an email to every registered user. Announcements can be targeted (all attendees, a single discipline, parents, ambassadors only) and pinned to the top of the feed.

### Profiles & contact cards *(Ambassador · Staff)*
Each user has a profile. Ambassadors and staff can opt to publish a phone number or email so teammates can reach them fast during the event. Visibility is per-field and per-audience — public, ambassadors-only, or private.

### Experts & campus navigation *(Expert · Participant)*
Every expert has a bio page; participants registered for a session can see which expert is assigned to it. Experts get an in-app campus map that routes them between the rooms they're judging, and participants can pull up directions to any session.

### Resources hub *(Everyone)*
The full master schedule plus a document library — maps, codes of conduct, track briefs, sponsor info, slide decks — all in one searchable place. Resources can be attached to a specific track so they surface in context.

### Check-in & logistics *(Admin)*
At the front desk the admin searches a name, confirms identity, and marks them checked-in with one tap. The dashboard shows live arrival counts by school and discipline.

### Volunteer hours & certificates *(Ambassador · Admin)*
Ambassadors log volunteer hours in the app. The app auto-generates a signed certificate PDF for those hours, ready to download — useful for school service requirements and college applications. Admins can add extra notes describing an ambassador's specific contributions.

### Activity marketing pages *(Ambassador editor)*
Every activity has a rich page — photos, captions, and descriptive text — that replaces the sprawl of separate Canva links. Assigned ambassadors edit their own track's page in-app.

### Additional capabilities
- **Spectating vs. participating** — open blocks offer sessions in other disciplines as spectator seats (not judged, not part of a team, separate from competitor caps)
- **Team formation** — participants build teams from registered app users; confirming registers everyone at once
- **Pre-summit engagement** — automated milestone reminders (synopsis submission, research data collection, slide upload, code of conduct)
- **Expert direct registration** — experts sign up and build their own bio page; admins verify and assign activities
- **Sponsor integration** — dedicated sponsor blocks on each activity's marketing page
- **Post-event photos** — LinkedIn post drafts with event photos and results; expert testimonial prompts

---

## Brand

| Name | Hex | Use |
|---|---|---|
| Emerald | `#0C7A55` | Primary actions |
| Deep Emerald | `#0A5F43` | Pressed / accents |
| Ink | `#16211C` | Text |
| Mist | `#EEF5F1` | Surfaces |

Typography uses iOS and Android system fonts for dense UI — free, accessible, and crisp at every size with dynamic type support.

---

## Technical architecture

Built once in Flutter and shipped to both iOS and Android from a single codebase. Backend-as-a-Service (Supabase or Firebase) provides hosted Postgres, authentication, file storage, and row-level security without self-hosted infrastructure.

### Auth & roles
Email magic-link or Google sign-in (most students have school Google accounts). Role picked on launch is stored on the user record and enforced with row-level security.

### Notifications
Push (APNs / FCM) for device alerts. A scheduler job computes each user's "next activity" lead-time pushes from their registrations. Announcements fan out to push + email in one server function.

### PDF generation
Feedback reports and volunteer certificates render server-side from HTML templates to PDF, stored in object storage, and surfaced as signed download links in the app.

### Core database tables

| Table | Key fields |
|---|---|
| `users` | id, name, role, email, phone, profile_visibility, checked_in_at |
| `activities` | id, discipline, track, title, room, start, end, capacity, marketing_json |
| `registrations` | id, user_id, activity_id, status (registered / waitlist / promoted) |
| `expert_assignments` | id, expert_id, activity_id |
| `rubrics` | id, activity_id, criteria_json, owner_ambassador_id |
| `scores` | id, expert_id, participant_id, activity_id, rubric_values, comments, released |
| `announcements` | id, author_id, body, audience, pinned, sent_at |
| `volunteer_hours` | id, user_id, hours, description, approved_by, certificate_url |
| `resources` | id, title, file_url, activity_id (nullable), category |

Row-level security keys off `users.role`: participants read their own registrations and released scores; ambassadors additionally write to rubrics and `activities.marketing_json` for assigned activities; experts write scores for assigned activities; admins have full write access.

---

## Getting started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.11+)
- Xcode (iOS) and/or Android Studio (Android), or Chrome for web development

### Run the app

```bash
git clone https://github.com/<org>/Emerald-Summit-App.git
cd Emerald-Summit-App
flutter pub get
flutter run
```

Target a specific device:

```bash
flutter run -d chrome    # Web
flutter run -d ios       # iOS simulator / device
flutter run -d android   # Android emulator / device
```

### Project structure

```
lib/
├── main.dart                 # App entry point
├── core/
│   ├── models/               # Shared data models (e.g. UserRole)
│   └── theme/                # Brand colors and Material theme
└── features/
    ├── home/                 # Role-selection homescreen
    └── auth/                 # Sign-in flows per role
```

---

## Current status

- [x] Flutter project scaffold (iOS, Android, web)
- [x] Brand theme (Emerald color system)
- [x] Role-selection homescreen (Participant, Ambassador, Expert, Admin, Parent)
- [x] Per-role login UI (Google + email magic link placeholders)
- [ ] Backend integration (Supabase / Firebase)
- [ ] Authentication
- [ ] Schedule builder
- [ ] Announcements feed
- [ ] Check-in dashboard
- [ ] Push notifications
- [ ] PDF certificate generation

---

## License

Proprietary — EHS Academic Foundation. All rights reserved.
