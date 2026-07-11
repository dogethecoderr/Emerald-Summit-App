// Volunteer hours & certificates (spec §04): ambassadors log hours; the app
// generates a signed certificate PDF once an admin approves them.

export type HoursStatus = 'pending' | 'approved';

export interface HoursEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  status: HoursStatus;
  approvedBy?: string;
}

export const MOCK_HOURS: HoursEntry[] = [
  {
    id: 'h1',
    date: 'Jun 14',
    hours: 3,
    description: 'Track marketing page build-out and photo shoot for TechVerse.',
    status: 'approved',
    approvedBy: 'Deepa Kannan',
  },
  {
    id: 'h2',
    date: 'Jun 21',
    hours: 2.5,
    description: 'Weekly ambassador sync + campus signage planning.',
    status: 'approved',
    approvedBy: 'Bharat Paliwal',
  },
  {
    id: 'h3',
    date: 'Jun 28',
    hours: 4,
    description: 'Sponsor outreach emails and follow-up calls.',
    status: 'pending',
  },
];
